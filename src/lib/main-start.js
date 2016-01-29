import _ from 'lodash';
import fs from 'fs';
import jsonfile from 'jsonfile';
import Immutable, {List, Map, fromJS} from 'immutable';
import moment from 'moment';
import path from 'path';
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

function loadDecks(config) {
	let decks = undefined;
	_.forEach(config.deckDirs, dir => {
		//console.log(dir)
		if (fs.existsSync(dir)) {
			//console.log("exists")
			// The files should be named in order of processing,
			// so sort the array so that we can directly update the item list
			const filenames = fs.readdirSync(dir);
			filenames.sort();
			_.forEach(filenames, filename => {
				if (path.extname(filename) === ".act1") {
					const act = jsonfile.readFileSync(path.join(dir, filename));
					decks = reducer(decks, act);
				}
			});
		}
	});
	return decks || {};
}

function loadQuestions(decks) {
	// Load score data
	const scores = Scores.load(config.scoreDir);
	//console.log(JSON.stringify(scores, null, '\t'))

	// Iterate through all problems, load the problem, find out how many
	// questions it has, add score history to decks, and calculate half-lives.
	decks.get("problems").forEach((problemData, problemUuid) => {
		//console.log({dirs: config.problemDirs})
		// Try to find a directory with the problem file
		const dir = _.find(config.problemDirs, dir => fs.existsSync(path.join(dir, problemUuid+".json")));
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
			// Add question indexes to decks
			decks = decks.setIn(["problems", problemUuid, "indexes"], indexes);

			const problemScores = scores[problemUuid];
			_.forEach(indexes, index => {
				const scoreData = _.get(problemScores, index);
				if (scoreData) {
					if (scoreData.history) {
						const halflives = Scores.calcHalflives(scoreData.history);
						console.log({halflives});
						if (!_.isEmpty(halflives)) {
							scoreData.halflives = halflives;
							scoreData.halflife = _.last(halflives);
							scoreData.due = moment(_.max(_.keys(scoreData.history))).add(scoreData.halflife, 'days').toISOString();
						}
					}
					decks = decks.setIn(["problems", problemUuid, "questions", index.toString()], fromJS(scoreData));
				}
				// For questions that haven't been scored yet:
				else {
					decks = decks.setIn(["problems", problemUuid, "questions", index.toString()], fromJS({}));
				}
			});
		}
	});
	return decks;
}

function calcReviewList(decks) {
	//console.log("calcReviewList")
	const weights = [];
	decks.get("problems").forEach((problemData, problemUuid) => {
		//console.log({problemData, problemUuid})
		problemData.get("questions").forEach((questionData, index) => {
			//console.log({questionData, index})
			const scoreDates = _.keys(questionData.get("history", Map()).toJS());
			//console.log({scoreDates, json: JSON.stringify(scoreDates)})
			if (scoreDates.length > 0) {
				const lastDateText = _.max(scoreDates);
				const lastDate = moment(lastDateText);
				const now = moment();
				const halflife = questionData.get("halflife", 1);
				const diff = now.diff(lastDate, 'minutes') / (24*60);
				const weight = diff / halflife;
				//console.log({lastDateText, now, halflife, diff, weight})
				weights.push([problemUuid, index, weight]);
			}
			else {
				weights.push([problemUuuid, index, 1]);
			}
		});
	});
	console.log({weights});
	return weights;
}

const program = require('commander');

let config;
let decks;
function init() {
	//console.log({process})
	config = loadConfig(program.user || "default");
	decks = loadDecks(config);
	decks = loadQuestions(decks);
	console.log(JSON.stringify(decks.toJS(), null, '\t'));
	calcReviewList(decks);
}
/*
function calcQuestionHalflives(decks0) {
	let decks = decks0;
	decks.get("questions").forEach((question, questionUuid) => {
		question.
	});
}
*/

/**
 * List active decks.
 * @param  {immutable:Map} decks - Map of decks
 */
function do_decks(decks) {
	//console.log("do_decks")
	//console.log(decks)
	// Create map from deck UUID to all of its children UUIDs
	const deckToChildren = {};
	const roots = [];
	decks.get("decks").forEach((deck, deckUuid) => {
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

	function print(uuid, indent=0) {
		const deck = decks.getIn(["decks", uuid]);
		console.log(_.repeat("  ", indent)+deck.get("name"));
		_.forEach(deckToChildren[uuid], uuid2 => print(uuid2, indent+1));
	}

	_.forEach(roots, uuid => {
		print(uuid);
	})
}

function repl() {
	const vorpal = require('vorpal')();
	vorpal
		.command("decks", "List active decks")
		.action((args, cb) => { do_decks(decks); cb(); })
		;
	vorpal
		.delimiter("quvault >")
		.show();
};

program
	.version('0.1')
	.option('-u, --user', 'user name');

program
	.command("decks")
	.description("List active decks")
	.action(() => { init(); do_decks(decks); });

program
	.command("repl")
	.action(() => { init(); repl();});

program
	.parse(process.argv);

//console.log(program)
if (program.args.length === 0) {
	init(); repl();
}
