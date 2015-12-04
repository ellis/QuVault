import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import jsonfile from 'jsonfile';

const version = "0.1";

const nomnom = require('nomnom').options({
	uuid: {
		position: 2,
		help: 'UUID of problem',
	},
	index: {
		position: 3,
		help: 'question index',
	},
	debug: {
		abbr: 'd',
		flag: true,
		help: 'Print debugging info'
	},
	question: {
		abbr: 'q',
		flag: true,
		help: 'Print question'
	},
	version: {
		flag: true,
		help: 'print version and exit',
		callback: function() {
			return "version "+version;
		}
	},
});

const argv = process.argv;
const opts = nomnom.parse(argv);

if (opts.debug) {
	console.log("opts:");
	console.log(opts);
}

if (!_.isEmpty(opts.uuid)) {
	const filenameJson = path.join("data", opts.uuid+".json");
	//console.log(filenameJson);
	if (fs.existsSync(filenameJson)) {
		const data = jsonfile.readFileSync(filenameJson);
		//console.log(JSON.stringify(data, null, "  "));

		if (opts.question) {
			const problemType = require('../problemTypes/default.js');
			const renderer = problemType.getQuestionRenderer(data, 0);
			//console.log(renderer)
			if (_.isPlainObject(renderer)) {
				console.log(renderer.data);
			}
		}
	}
}
