import _ from 'lodash';
import assert from 'assert';
//import fs from 'fs';
//import jsonfile from 'jsonfile';
//import Immutable, {List, Map, fromJS} from 'immutable';
//import moment from 'moment';
import path from 'path';
import xdgBasedir from 'xdg-basedir';

export default function loadConfig(username) {
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
	return config;
}
