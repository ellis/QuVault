import _ from 'lodash';
import assert from 'assert';
import fs from 'fs';
import jsonfile from 'jsonfile';
import Immutable, {List, Map, fromJS} from 'immutable';
import inquirer from 'inquirer';
import mkdirp from 'mkdirp';
import moment from 'moment';
import path from 'path';
//import random from 'random-js';
import reducer from './reducer.js';

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

const program = require('commander');

let config;
let state = Map();
function init() {
	//console.log({process})
	state = reducer(state, {type: "loadConfig", username: program.user || "default"});
	state = reducer(state, {type: "loadDecks"});
	state = reducer(state, {type: "loadQuestions"});
	state = reducer(state, {type: "calcReviewOrder"});
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
		console.log(_.padStart(index.toString(), indexPadding)+") "+_.repeat("  ", indent)+deck.get("name") + ` (${deck.get("new", 0)}n ${deck.get("pending", 0)}p ${deck.get("waiting", 0)}w)`);
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

function do_dump(state, path) {
	if (path) {
		path = path.split(".");
		state = state.getIn(path);
	}
	console.log(JSON.stringify(state, null, '\t'));
}

function do_review(deckRef, cb) {
	function getDeckUuid() {
	  if (deckRef) {
			const deckIndex = parseInt(deckRef);
			return state.getIn(["indexes", deckIndex.toString()]);
		}
	}
	const deckUuid = getDeckUuid();
	console.log({deckRef, deckUuid})

	state = state.updateIn(["scoreFilename"], undefined, x => {
		if (_.isUndefined(x)) {
			const scoreDir = state.getIn(["config", "scoreDir"]);
			mkdirp.sync(scoreDir);
			return path.join(scoreDir, generateSessionFilename());
		}
		else {
			return x;
		}
	});

	function reviewOne() {
		// Get the next item in order
		const orderItem = state.get("order", List()).find(x => {
			if (x.get("weight") < 1) return false;
			if (!deckUuid) return true; // choose first item in order list
			//console.log({x, path: ["problems", x.problemUuid, "decks", deckUuid], value: state.getIn(["problems", x.problemUuid, "decks", deckUuid])});
			return state.getIn(["problems", x.get("problemUuid"), "decks", deckUuid], false) === true;
		});
		if (!orderItem) {
			cb();
		}
		else {
			const problemUuid = orderItem.get("problemUuid");
			const index = orderItem.get("index");
			do_question(state, problemUuid, index, cb2);
		}
	}

	function cb2(type, data) {
		switch (type) {
			case "skip":
				state = reducer(state, data);
				return reviewOne();
			case "score":
				state = reducer(state, data);
				console.log({scoreStuff: state.getIn(["problems", data.problemUuid, "questions", data.index.toString(), "history"])});
				return reviewOne();
			default:
				return cb();
		}
	}

	reviewOne();
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

function doInteractive(state, problemUuid, index, problemType, problem, cb) {
	//console.log(`doInteractive(${problemUuid}, ${index})`)

	const format = "markdown";
	const renderer = problemType.getQuestionFlashcardRenderer(format, problem, index, undefined, false);
	//console.log(renderer)
	if (_.isPlainObject(renderer)) {
		console.log();
		console.log(renderer.data);
		console.log();
	}

	const prompt1 = {type: "input", name: "response", message: "Your reponse [ENTER=continue, q=quit]: "};
	const prompt2 = {type: "input", name: "score", message: "Your score (0=no idea, 2=wrong, 3=acceptable, 4=good, 5=easy): ", filter: (s) => parseInt(s), validate: isInteger};
	inquirer.prompt(prompt1, ({response}) => {
		if (response === "q") {
			return cb("quit");
		}
		else if (response === "skip") {
			return cb("skip", {type: "skipQuestion", problemUuid, index});
		}

		// console.log("RESPONSE: "+JSON.stringify(response));
		console.log("ANSWER:");
		const answer = problemType.renderFlashcardAnswer(format, problem, index, response).data;
		console.log(answer);
		console.log();

		inquirer.prompt(prompt2, ({score}) => {
			//console.log(score);
			const dateText = moment().format();
			// Update score history in state
			/*state = state.setIn(["problems", problemUuid, "questions", index.toString(), "history", dateText, "score"], score);
			console.log({path: ["problems", problemUuid, "questions", index.toString(), "history", dateText, "score"], score: state.getIn(["problems", problemUuid, "questions", index.toString(), "history", dateText, "score"])})*/
			// Save score
			const response1 = (_.isEmpty(response)) ? null : response;
			const data = [problemUuid, index, dateText, score, response1];
			const text = JSON.stringify(data);
			const scoreFilename = state.getIn(["scoreFilename"]);
			//console.log(text);
			if (!fs.existsSync(scoreFilename)) {
				fs.writeFileSync(scoreFilename, "", "utf8", err => {});
			}
			fs.appendFileSync(scoreFilename, text+"\n", "utf8", err => {});
			cb("score", {type: "scoreQuestion", problemUuid, index, dateText, score});
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
		.command("dump [path]")
		.description("Dump the program state to the console in JSON format")
		.action((args, cb) => { do_dump(state, args.path); cb(); });
	vorpal
		.command("review [deck]")
		.description("Start review (optionally for a given deck).")
		.action((args, cb) => { do_review(args.deck, cb); });

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
