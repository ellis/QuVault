import _ from 'lodash';
import assert from 'assert';
import fs from 'fs';
import jsonfile from 'jsonfile';
import Immutable, {List, Map, fromJS} from 'immutable';
import inquirer from 'inquirer';
import mkdirp from 'mkdirp';
import moment from 'moment';
import path from 'path';
import random from 'random-js';
import xdgBasedir from 'xdg-basedir';
import loadConfig from './loadConfig.js';
import reducer from './reducer.js';
import * as Scores from './Scores.js';

/**
 * The format of the data is:
 *
 * ```{yaml}
 * decks:
 *   DECKUUID1:
 *     uuid: DECKUUID1
 *     name: DECKNAME1
 *     parent: ...
 *     after: ...
 *   DECKUUID2:
 *     ...
 * problems:
 *   PROBUUID1:
 *     decks:
 *       DECKUUID?: true
 *     indexes: [INDEX1, ...]
 *     questions:
 *       INDEX1:
 *         history:
 *           ISODATE1:
 *             score: <integer>
 *         halflives: [...]
 *         halflife: <number>
 *         due: <isodate>
 * reviewList: [PROBUUIDs]
 * ```
 */

function loadDecks(state) {
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
	return state || {};
}

function loadQuestions(state) {
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
	return state;
}

function calcReviewList(state) {
	//console.log("calcReviewList")
	const mt = random.engines.mt19937();
	mt.autoSeed();
	const weights = [];
	state.get("problems").forEach((problemData, problemUuid) => {
		//console.log({problemData, problemUuid})
		problemData.get("questions").forEach((questionData, index) => {
			//console.log({questionData, index})
			const scoreDates = _.keys(questionData.get("history", Map()).toJS());
			//console.log({scoreDates, json: JSON.stringify(scoreDates)})
			let weight = 1;
			let randWeight = 1;
			const isNew = (scoreDates.length == 0);
			if (scoreDates.length > 0) {
				const lastDateText = _.max(scoreDates);
				const lastDate = moment(lastDateText);
				const now = moment();
				const halflife = questionData.get("halflife", 1);
				const diff = now.diff(lastDate, 'minutes') / (24*60);
				weight = diff / halflife;
				//console.log({lastDateText, now, halflife, diff, weight})
				const factor = random.real(-0.1, 0.1, true)(mt);
				randWeight = (1 + factor) * weight;
			}
			weights.push([problemUuid, index, weight, randWeight, isNew]);
		});
	});
	const l0 = _.sortBy(weights, x => -x[3]);
	const l1 = l0.map(([problemUuid, index, weight, , isNew]) => { return {problemUuid, index, weight, isNew}; });
	const deckOrders = {};
	_.forEach(l1, ({problemUuid, index, isNew}) => {
		const decks = state.getIn(["problems", problemUuid, "decks"], Map());
		decks.forEach((x, deckUuid) => {
			const l2 = deckOrders[deckUuid] || [];
			l2.push({problemUuid, index, isNew});
			deckOrders[deckUuid] = l2;
		});
	});
	_.forEach(deckOrders, (x, deckUuid) => {
		state = state.setIn(["decks", deckUuid, "order"], fromJS(x));
	});
	state = state.set("order", fromJS(l1));
	return state;
}

const program = require('commander');

let config;
let state;
function init() {
	//console.log({process})
	state = loadConfig(program.user || "default");
	state = loadDecks(state);
	state = loadQuestions(state);
	state = calcReviewList(state);
	//console.log(JSON.stringify(state.toJS(), null, '\t'));
}

/**
 * List active decks.
 * @param  {immutable:Map} state - program state
 */
function do_decks(state) {
	//console.log("do_decks")
	//console.log(state)
	// Create map from deck UUID to all of its children UUIDs
	const deckToChildren = {};
	const roots = [];
	state.get("decks").forEach((deck, deckUuid) => {
		//console.log({deck});
		if (deck.has("parent")) {
			const parentUuid = deck.get("parent");
			const children = deckToChildren[parentUuid] || [];
			//console.log({children})
			children.push(deckUuid);
			deckToChildren[parentUuid] = children;
		}
		else {
			roots.push(deckUuid);
		}
		deckToChildren[deckUuid] = deckToChildren[deckUuid] || [];
	});
	//console.log({deckToChildren})
	/*const l1 = _.toPairs(deckToChildren);
	console.log({l1})
	const l2 = _.sortBy(l1, x => -x[1].length);
	console.log(JSON.stringify(l2, null, '\t'));*/

	const indexes = {};
	let index = 1;
	const indexPadding = state.get("decks").count().toString().length;
	function print(uuid, indent=0) {
		const deck = state.getIn(["decks", uuid], Map());
		//console.log({deck})
		//console.log({order: deck.get("order")})
		const [newCount, pendingCount] = deck.get("order", List()).reduce(
			(acc, item) => (item.get("isNew")) ? [acc[0] + 1, acc[1]] : [acc[0], acc[1] + 1],
			[0, 0]
		)
		console.log(_.padStart(index.toString(), indexPadding)+") "+_.repeat("  ", indent)+deck.get("name") + `  (${newCount}/${pendingCount})`);
		// Update indexes list
		indexes[index.toString()] = uuid;
		index++;
		// Recurse into children
		_.forEach(deckToChildren[uuid], uuid2 => print(uuid2, indent+1));
	}

	_.forEach(roots, uuid => {
		print(uuid);
	});

	// Set indexes list in state
	state = state.set("indexes", fromJS(indexes));
	return state;
}

function do_dump(state) {
	console.log(JSON.stringify(state, null, '\t'));
}

function do_review(state0, deckRef, cb) {
	/*if (deckRef) {
		const deckIndex = parseInt(deckRef);
		const deckUuid = state.getIn(["indexes", deckIndex]);
		if (deckUuid)
	}*/

	// TODO: filter the order list according to deckRef

	const order = state0.get("order", List()).filter(x => {
		return true;
	});

	// TODO: iterate through all questions (until use enters 'quit')
	const problemUuid = order.getIn([0, "problemUuid"]);
	const index = order.getIn([0, "index"]);

	function cb2() {
		state = calcReviewList(state0);
	}
	do_question(state, problemUuid, index, cb);
}

function do_question(state, problemUuid, index, cb) {
	//console.log(`do_question(${problemUuid}, ${index})`);
	// Try to find a directory with the problem file
	const dir = state.getIn(["config", "problemDirs"], List()).find(dir => fs.existsSync(path.join(dir, problemUuid+".json")));
	const filenameJson = path.join(dir, problemUuid+".json");

	//console.log(filenameJson);
	if (fs.existsSync(filenameJson)) {
		const problem = jsonfile.readFileSync(filenameJson);
		//console.log(JSON.stringify(data, null, "  "));

		const problemType = require('../problemTypes/default.js');
		//console.log({problemType})

		doInteractive(state, problemUuid, index, problemType, problem, cb);
	}
}

function doInteractive(state, uuid, index, problemType, problem, cb) {
	//console.log(`doInteractive(${uuid}, ${index})`)
	const scoreDir = state.getIn(["config", "scoreDir"]);
	mkdirp.sync(scoreDir);
	const scoreFilename = path.join(scoreDir, generateSessionFilename());
	console.log({scoreFilename})
	let isScoreFileOpen = false;

	const format = "markdown";
	const renderer = problemType.getQuestionFlashcardRenderer(format, problem, index, undefined, false);
	//console.log(renderer)
	if (_.isPlainObject(renderer)) {
		console.log();
		console.log(renderer.data);
		console.log();
	}

	const prompt1 = {type: "input", name: "response", message: "Your reponse: "};
	const prompt2 = {type: "input", name: "score", message: "Your score (0=no idea, 2=wrong, 3=acceptable, 4=good, 5=easy): ", filter: (s) => parseInt(s), validate: isInteger};
	inquirer.prompt(prompt1, ({response}) => {
		console.log("RESPONSE: "+JSON.stringify(response));
		console.log("ANSWER:");
		const answer = problemType.renderFlashcardAnswer(format, problem, index, response).data;
		console.log(answer);
		console.log();

		inquirer.prompt(prompt2, ({score}) => {
			console.log(score);
			const response1 = (_.isEmpty(response)) ? null : response;
			const data = [uuid, index, moment().format(), score, response1];
			const text = JSON.stringify(data);
			console.log(text);
			if (!isScoreFileOpen) {
				fs.writeFileSync(scoreFilename, "", "utf8", err => {});
				isScoreFileOpen = true;
			}
			fs.appendFileSync(scoreFilename, text, "utf8", err => {});
			cb();
		});
	});
}

/**
 * Create a session filename of the format `${DATE_AND_TIME}-${RANDOMHASH}.rec1`
 * @return {string} filename
 */
function generateSessionFilename() {
	let d = new Date().getTime();
	const hash = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});

	const date = moment().utc().format("YYYYMMDD_HHmmss");
	return `${date}-${hash}.rec1`;
}

function isInteger(s) {
	return /^\+?(0|[1-9]\d*)$/.test(s);
}

function repl(args) {
	init();
	const vorpal = require('vorpal')();
	vorpal
		.command("decks")
		.description("List active decks")
		.action((args, cb) => { state = do_decks(state); cb(); });
	vorpal
		.command("dump")
		.description("Dump the program state to the console in JSON format")
		.action((args, cb) => { do_dump(state); cb(); });
	vorpal
		.command("review [deck]")
		.description("Start review (optionally for a given deck).")
		.action((args, cb) => { do_review(state, args.deck, cb); });

	if (_.isEmpty(args) || args.length < 2) {
		vorpal
			.delimiter("quvault >")
			.show();
	}
	else {
		vorpal.parse(args);
	}
};

program
	.version('0.1')
	.option('-u, --user', 'user name');

program
	.parse(process.argv);

const args = (process.argv.length > 2) ? _.concat(_.take(process.argv, 2), _.drop(process.argv, 2)) : undefined;

// if (process.argv.length == 2) {
// 	program.outputHelp();
// }
repl(args)
