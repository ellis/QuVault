import _ from 'lodash';
import commander from 'commander';
import fs from 'fs';
import path from 'path';
import xdgBasedir from 'xdg-basedir';

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
	_.flatMap(config.deckDirs, dir => {
		const filenames0 = fs.readdirSync(userdir);
		// The files should be named in order of processing,
		// so sort the array so that we can directly update the item list
		const filenames = _.filter(filenames0, filename => path.extname(filename) === ".dec1");
		filenames.sort();
		filenames
	})
}
