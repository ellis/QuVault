import _ from 'lodash';
import assert from 'assert';
import fs from 'fs';
import jsonfile from 'jsonfile';
import Immutable, {List, Map, fromJS} from 'immutable';
import moment from 'moment';
import path from 'path';
import random from 'random-js';
import xdgBasedir from 'xdg-basedir';
import * as Scores from './Scores.js';

export const initialState = Map();

export default class StateWrapper {
	/**
	 * Create a StateWrapper
	 * @param  {object|immutable:Map} state - state to wrap
	 */
	constructor(state = initialState) {
		this.state = fromJS(state);
	}

	getState() { return this.state; }

	check() {
		// TODO: check validity of state
	}

	loadConfig(username) {
		assert(_.isString(username));
		assert(!_.isEmpty(username));
		/*const config = {
			problemDirs: {
				_order: ["user", "data[]"],
				user: path.join(xdgBasedir.data, "quvault", "userdata", username, "questions"),
				"data[]": xdgBasedir.dataDirs.map(dir => path.join(dir, "quvault", "questions")),
			},
			deckDirs: {

			}
			* questions: `$HOME/.local/share/quvault/questions/` and `$HOME/.local/share/quvault/userdata/$USER/questions/`
			* decks: `$HOME/.local/share/quvault/decks/` and `$HOME/.local/share/quvault/userdata/$USER/decks/`
			* user responses: `$HOME/.local/share/quvault/userdata/$USER/scores/`

		};
		const filename = path.join(xdgBasedir.config, "quvault/quvault.yaml");
		if (fs.exists(filename))*/
		const config = {
			username: username,
			problemDirs: _.flatten([
				path.join(xdgBasedir.data, "quvault", "userdata", username, "problems"),
				xdgBasedir.dataDirs.map(dir => path.join(dir, "quvault", "problems"))
			]),
			deckDirs: _.flatten([
				path.join(xdgBasedir.data, "quvault", "userdata", username, "decks"),
				xdgBasedir.dataDirs.map(dir => path.join(dir, "quvault", "decks"))
			]),
			scoreDir: path.join(xdgBasedir.data, "quvault", "userdata", username, "scores"),
		};
		this.state = this.state.set("config", fromJS(config));
		return this;
	}

	loadDecks() {
		let state = this.state;
		var reducer = require('./reducer.js').default;
		state.getIn(["config", "deckDirs"], List()).forEach(dir => {
			//console.log({dir})
			if (fs.existsSync(dir)) {
				//console.log("exists")
				// The files should be named in order of processing,
				// so sort the array so that we can directly update the item list
				const filenames = fs.readdirSync(dir);
				filenames.sort();
				//console.log({filenames})
				_.forEach(filenames, filename => {
					const ext = path.extname(filename);
					if (ext === ".act1") {
						const act = jsonfile.readFileSync(path.join(dir, filename));
						state = reducer(state, act);
					}
					else if (ext === ".json") {
						const content = jsonfile.readFileSync(path.join(dir, filename));
						assert(content.format === 1);
						state = state.mergeDeep(fromJS(_.omit(content, ["format"])));
					}
				});
			}
		});
		this.state = state;
		return this;
	}

	loadQuestions() {
		let state = this.state;
		// Load score data
		const scores = Scores.load(state.getIn(["config", "scoreDir"]));
		//console.log(JSON.stringify(scores, null, '\t'))

		// Iterate through all problems, load the problem, find out how many
		// questions it has, add score history to state, and calculate half-lives.
		state.get("problems").forEach((problemData, problemUuid) => {
			//console.log({dirs: config.problemDirs})
			// Try to find a directory with the problem file
			const dir = state.getIn(["config", "problemDirs"], List()).find(dir => fs.existsSync(path.join(dir, problemUuid+".json")));
			//console.log({problemUuid, dir});
			if (dir) {
				// Load problem to find its quesiton indexes
				const filenameJson = path.join(dir, problemUuid+".json");
				const problem = jsonfile.readFileSync(filenameJson);
				//console.log(JSON.stringify(problem, null, "  "));
				const problemType = require('../problemTypes/default.js');
				const indexes = (problemType.getFlashcardQuestionIndexes)
					? problemType.getFlashcardQuestionIndexes(problem) || [0]
					: [0];
				// Add question indexes to state
				state = state.setIn(["problems", problemUuid, "indexes"], indexes);

				const problemScores = scores[problemUuid];
				_.forEach(indexes, index => {
					const scoreData = _.get(problemScores, index);
					if (scoreData) {
						if (scoreData.history) {
							const halflives = Scores.calcHalflives(scoreData.history);
							//console.log({halflives});
							if (!_.isEmpty(halflives)) {
								scoreData.halflives = halflives;
								scoreData.halflife = _.last(halflives);
								scoreData.due = moment(_.max(_.keys(scoreData.history))).add(scoreData.halflife, 'days').toISOString();
							}
						}
						state = state.setIn(["problems", problemUuid, "questions", index.toString()], fromJS(scoreData));
					}
					// For questions that haven't been scored yet:
					else {
						state = state.setIn(["problems", problemUuid, "questions", index.toString()], fromJS({}));
					}
				});
			}
		});

		this.state = state;
		return this;
	}

	calcReviewOrder() {
		//console.log("calcReviewList")
		let state = this.state;
		const mt = random.engines.mt19937();
		mt.autoSeed();
		const weights = [];
		state.get("problems", Map()).forEach((problemData, problemUuid) => {
			//console.log({problemData, problemUuid})
			problemData.get("questions", Map()).forEach((questionData, index) => {
				//console.log({questionData, index})
				const scoreDates = _.keys(questionData.get("history", Map()).toJS());
				//console.log({scoreDates, json: JSON.stringify(scoreDates)})
				let weight = 1;
				let randWeight = 1;
				let status;
				// If the question is new:
				if (scoreDates.length === 0) {
					status = "new";
				}
				// If the question is on the skip list:
				else if (state.getIn(["skipList", problemUuid, index.toString()], false)) {
					weight = 0;
					randWeight = 0;
					status = "waiting";
				}
				else {
					const lastDateText = _.max(scoreDates);
					const lastDate = moment(lastDateText);
					const now = moment();
					const halflife = questionData.get("halflife", 1);
					const diff = now.diff(lastDate, 'minutes') / (24*60);
					weight = diff / halflife;
					//console.log({lastDateText, now, halflife, diff, weight})
					// Randomly shift the weight between 90% and 110%
					const factor = random.real(-0.1, 0.1, true)(mt);
					randWeight = (1 + factor) * weight;
					status = (weight >= 1) ? "pending" : "waiting";
				}
				weights.push([problemUuid, index, weight, randWeight, status]);
			});
		});
		const l0 = _.sortBy(weights, x => -x[3]);
		const l1 = l0.map(([problemUuid, index, weight, , status]) => { return {problemUuid, index, weight, status}; });
		//const deckOrders = {};
		const deckProblemCounts = {};
		_.forEach(l1, ({problemUuid, index, status}) => {
			const decks = state.getIn(["problems", problemUuid, "decks"], Map());
			decks.forEach((x, deckUuid) => {
				/*const l2 = deckOrders[deckUuid] || [];
				l2.push({problemUuid, index, status});
				deckOrders[deckUuid] = l2;*/
				if (!deckProblemCounts.hasOwnProperty(deckUuid)) {
					deckProblemCounts[deckUuid] = {new: 0, pending: 0, waiting: 0};
				}
				const path = [deckUuid, status];
				_.set(deckProblemCounts, path, _.get(deckProblemCounts, path, 0) + 1);
			});
		});
		/*_.forEach(deckOrders, (x, deckUuid) => {
			state = state.setIn(["decks", deckUuid, "order"], fromJS(_.map(x, x => [x.problemUuid, x.index])));
		});*/
		state = state.mergeDeepIn(["decks"], fromJS(deckProblemCounts));
		state = state.set("order", fromJS(l1));

		this.state = state;
		return this;
	}

	/**
	 * Create a new deck of problems.
	 * @param  {string} uuid - UUID for the new deck
	 * @param  {string} name - name for the new deck
	 * @param  {string} parent - UUID of the deck's parent
	 * @param  {string} after - UUID of a sibling problem that this problem should be ordered after when decks are listed
	 * @return {StateWrapper} pointer to self
	 */
	createDeck(uuid, name, parent, after) {
		const deck = _.merge({}, {
			uuid,
			name,
			parent,
			after
		});
		this.state = this.state.setIn(["decks", uuid], fromJS(deck));
		return this;
	}

	/**
	 * Add a list of problem UUIDs to a deck.
	 * @param {array} problemUuids - an array of UUID strings of problems to add to the given deck
	 * @param {string} deckUuid - UUID of the deck
	 * @return {StateWrapper} pointer to self
	 */
	addProblemsToDeck(problemUuids, deckUuid) {
		_.forEach(problemUuids, problemUuid => {
			this.state = this.state.setIn(["problems", problemUuid, "decks", deckUuid], true);
		});
		return this;
	}

	scoreQuestion(problemUuid, index, dateText, score) {
		// Add score to question's history
		this.state = this.state.setIn(["problems", problemUuid, "questions", index.toString(), "history", dateText, "score"], score);

		// Calculate the new halflife
		const scoreData = this.state.getIn(["problems", problemUuid, "questions", index.toString()]).toJS();
		const halflives = Scores.calcHalflives(scoreData.history);
		//console.log({halflives});
		if (!_.isEmpty(halflives)) {
			scoreData.halflives = halflives;
			scoreData.halflife = _.last(halflives);
			scoreData.due = moment(_.max(_.keys(scoreData.history))).add(scoreData.halflife, 'days').toISOString();
		}
		this.state = this.state.mergeDeepIn(["problems", problemUuid, "questions", index.toString()], fromJS(scoreData));

		// Update the review order
		return this.calcReviewOrder();
	}

	skipQuestion(problemUuid, index) {
		// Add question to skipList
		this.state = this.state.setIn(["skipList", problemUuid, index.toString()], true);
		console.log("skipList", this.state.getIn(["skipList"]));
		// Update the review order
		return this.calcReviewOrder();
	}
};
