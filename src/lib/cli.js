import _ from 'lodash';
import fs from 'fs';
import jsonfile from 'jsonfile';
import path from 'path';
import yaml from 'js-yaml';

const version = "0.1";

const nomnom = require('nomnom').options({
	uuid: {
		position: 2,
		help: 'UUID/index of problem/question',
	},
	debug: {
		abbr: 'd',
		flag: true,
		help: 'Print debugging info'
	},
	mode: {
		abbr: "m",
		help: "operation mode (flashcard, exam, exam-with-answers, list, list-with-answers)",
		default: "flashcard"
	},
	format: {
		abbr: "f",
		help: "render format (markdown, html, html-interactive)",
		default: "markdown"
	},
	interactive: {
		abbr: "i",
		help: "interactive mode",
		flag: true
	},
	response: {
		abbr: "r",
		help: "User's response to the question"
	},
	score: {
		abbr: "s",
		flag: true,
		help: "try to autoscore the user's response",
	},
	answer: {
		abbr: "a",
		flag: true,
		help: "Print answer"
	},
	version: {
		flag: true,
		help: 'print version and exit',
		callback: function() {
			return "version "+version;
		}
	},
	import: {
		help: "import a problem set"
	},
	addUuid: {
		abbr: 'u',
		flag: true,
		help: "Add missing UUID to imported problems"
	}
});


function generateUuid() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid;
}

const argv = process.argv;
const opts = nomnom.parse(argv);

if (opts.debug) {
	console.log("opts:");
	console.log(opts);
}

function doImport() {
	const filename = opts.import;
	const documents = [];
	console.log(path.extname(filename));
	if (path.extname(filename) === ".yaml") {
		const content = fs.readFileSync(filename, 'utf8');
		console.log(content);
		yaml.safeLoadAll(content, doc => {
			if (!_.isEmpty(doc))
				documents.push(doc)
		});
	}
	if (opts.debug) {
		console.log(`documents: ${JSON.stringify(documents, null, '  ')}`);
	}
	const documentsMissingUuid = _.filter(documents, doc => _.isEmpty(doc.uuid));
	if (!_.isEmpty(documentsMissingUuid)) {
		if (opts.addUuid) {
			for (const problem of documentsMissingUuid) {
				problem.uuid = generateUuid();
				if (opts.debug) {
					console.log(yaml.safeDump(problem));
					console.log("---");
				}
			}
			fs.writeFileSync(filename, "", "utf8", err => {});
			for (const problem of documents) {
				const content2 = yaml.safeDump(problem) + "\n---\n";
				fs.appendFileSync(filename, content2, "utf8", err => {});
			}
		}
		else {
			console.log("These problems are missing UUIDs:");
			console.log(documentsMissingUuid);
			return;
		}
	}

	// Create problem files
	fs.mkdir("problems");
	for (const problem of documents) {
		const filename = path.join("problems", problem.uuid+".json");
		const content2 = JSON.stringify(problem, null, "\t");
		fs.writeFileSync(filename, content2, "utf8", err => {});
	}
}

if (opts.import) {
	doImport();
}

else if (!_.isEmpty(opts.uuid)) {
	const slashPos = opts.uuid.indexOf("/");
	const uuid = (slashPos > 0) ? opts.uuid.substring(0, slashPos) : opts.uuid;
	const index = (slashPos > 0) ? parseInt(opts.uuid.substring(slashPos + 1)) : 0;
	const filenameJson = path.join("problems", uuid+".json");
	const filenameYaml = path.join("problems", uuid+".yaml");

	//console.log(filenameJson);
	if (fs.existsSync(filenameJson)) {
		const problem = jsonfile.readFileSync(filenameJson);
		//console.log(JSON.stringify(data, null, "  "));

		const problemType = require('../problemTypes/default.js');
		if (opts.interactive) {
			
		}
		else {
			const renderer = problemType.getQuestionFlashcardRenderer(opts.format, problem, index, opts.response, opts.answer);
			//console.log(renderer)
			if (_.isPlainObject(renderer)) {
				console.log(renderer.data);
			}
			if (opts.score && !_.isUndefined(opts.response)) {
				const scorer = problemType.getResponseScorer(opts.format, problem, index, opts.response);
				console.log(scorer);
				if (_.isPlainObject(scorer)) {
					console.log(scorer.data);
				}
			}
		}
	}
}
