import _ from 'lodash';
import fs from 'fs';
import inquirer from 'inquirer';
import jsonfile from 'jsonfile';
import path from 'path';
import xdgBasedir from 'xdg-basedir';
import reducer from './reducer.js';

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
		console.log(dir)
		if (fs.existsSync(dir)) {
			console.log("exists")
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

const program = require('commander');

program
	.version('0.1')
	.option('-u, --user', 'user name')
	.parse(process.argv);

const config = loadConfig(program.user || "default");
const decks = loadDecks(config);
console.log(JSON.stringify(decks, null, '\t'));

function repl() {
	inquirer.prompt(
		[{type: "input", name: "command", message: "(? for help)"}],
		(answers) => {
			if (answers.command === "quit") {
				process.exit(0);
			}
			else if (answers.command === "decks") {
				// Create map from deck to all of its children
				const deckToChildren = {};
				_.forEach(decks.decks, deck => {
					if (deck.parent) {
						const children = deckToChildren[deck.parent] || [];
						children.push(deck.uuid);
						deckToChildren[deck.parent] = children.push();
					}
					deckToChildren[deck.uuid] = deckToChildren[deck.uuid] || [];
				});
				const l1 = _.toPairs(deckToChildren);
				const l2 = _.sortBy(l1, x => x[1].length);
				console.log(JSON.stringify(l2, null, '\t'));
			}
		}
		
	);
}

repl();
