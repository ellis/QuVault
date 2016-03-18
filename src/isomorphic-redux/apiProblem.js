import _ from 'lodash';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import jsonfile from 'jsonfile';
import Immutable, {List, Map, fromJS} from 'immutable';

export function getQuestion(req, res) {
	const problemUuid = req.params.problemUuid;
	const index = req.params.index;
	const reducer = require('../lib/reducer.js').default;
	const actions = [
		{type: "loadConfig", username: req.params.username}
	];
	const state = actions.reduce(reducer, Map());
	//console.log(JSON.stringify(state.toJS(), null, '\t'))

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

		const format = "markdown";
		const renderer = problemType.getQuestionFlashcardRenderer(format, problem, index, undefined, false);
		assert(_.isPlainObject(renderer));
		res.json(renderer);
	}
}
