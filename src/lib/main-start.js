import _ from 'lodash';
import fs from 'fs';
import jsonfile from 'jsonfile';
import Immutable, {fromJS} from 'immutable';
import path from 'path';
import xdgBasedir from 'xdg-basedir';
import reducer from './reducer.js';
import * as Scores from './Scores.js';

function loadConfig(username) {
	/*const config = {
		questionDirs: {
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
		questionDirs: _.flatten([
			path.join(xdgBasedir.data, "quvault", "userdata", username, "questions"),
			xdgBasedir.dataDirs.map(dir => path.join(dir, "quvault", "questions"))
		]),
		deckDirs: _.flatten([
			path.join(xdgBasedir.data, "quvault", "userdata", username, "decks"),
			xdgBasedir.dataDirs.map(dir => path.join(dir, "quvault", "decks"))
		]),
		scoreDir: path.join(xdgBasedir.data, "quvault", "userdata", username, "scores"),
	};
	return config;
}

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

function loadScores(decks) {
	let scores = Scores.load(config.scoreDir);
	//console.log("loadScores:")
	//console.log(JSON.stringify(scores, null, '\t'))

	//let decks = decks0;
	/*decks.get("questions").forEach((question, questionUuid) => {
		CONTINUE
		question.
	});*/
	return scores;
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

const program = require('commander');

let config;
let decks;
function init() {
	//console.log({process})
	config = loadConfig(program.user || "default");
	decks = loadDecks(config);
	const scores = loadScores(decks);
	decks = decks.set("scores", fromJS(scores));
	console.log(JSON.stringify(decks.toJS(), null, '\t'));
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
