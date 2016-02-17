import _ from 'lodash';
import fs from 'fs';
import jsonfile from 'jsonfile';
import mkdirp from 'mkdirp';
import moment from 'moment';
import random from 'random-js';
import path from 'path';
import yaml from 'js-yaml';
import reducer from './reducer.js';
//import * as userdata from './userdata.js';

const version = "0.1";

const mt = random.engines.mt19937();
mt.autoSeed();

function generateUuid() {
	/*var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid;*/
	return random.uuid4(mt);
}

function doImport(config, filename) {
	const documents = [];
	//console.log(path.extname(filename));
	if (path.extname(filename) === ".yaml") {
		const content = fs.readFileSync(filename, 'utf8');
		if (config.debug) {
			console.log(content);
		}
		yaml.safeLoadAll(content, doc => {
			if (!_.isEmpty(doc))
				documents.push(doc)
		});
	}
	if (config.debug) {
		console.log(`documents: ${JSON.stringify(documents, null, '  ')}`);
	}
	const documentsMissingUuid = _.filter(documents, doc => doc.enabled !== false && _.isEmpty(doc.uuid));
	//console.log({documentsMissingUuid})
	if (!_.isEmpty(documentsMissingUuid)) {
		if (config.addUuid) {
			for (const problem of documentsMissingUuid) {
				problem.uuid = generateUuid();
				if (config.debug) {
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

	// Create deck file
	const deckFile = {
		format: 1,
		decks: {},
		problems: {}
	};
	const doc0 = documents.shift();
	const deckUuid = doc0.uuid;
	if (!doc0.hasOwnProperty("DECK")) {
		console.log("First entry must have property 'DECK'");
		process.exit(-1);
	}
	const deck = doc0.DECK;
	deckFile.decks[deckUuid] = _.omit(deck, ['uuid']);
	// Add problem data to deck file
	for (const problem of documents) {
		deckFile.problems[problem.uuid] = _.set({}, ["decks", deckUuid], true);
	}
	// FIXME: add date, delete other files with same uuid
	const deckFilename = path.join(config.deckDirs[0], deckUuid+".json");
	//console.log({filename})
	const deckFileContent = JSON.stringify(deckFile, null, "\t");
	fs.writeFileSync(deckFilename, deckFileContent+"\n", "utf8", err => {});

	// Create problem files
	const problemDir = config.problemDirs[0];
	mkdirp.sync(problemDir);
	//console.log({problemDir})
	for (const problem of documents) {
		if (problem.enabled !== false) {
			problem.deckUuid = deckUuid;
			const filename = path.join(problemDir, problem.uuid+".json");
			//console.log({filename})
			const content2 = JSON.stringify(problem, null, "\t");
			fs.writeFileSync(filename, content2, "utf8", err => {});
		}
	}
}


const program = require('commander');

program
	.version('0.1')
	.usage("[options] <file ...>")
	.option('--debug', "print debug information")
	.option('-u, --user <username>', 'user name')
	.option('--addUuid', "Automatically add missing UUIDs to input file");

program
	.parse(process.argv);

//console.log(program)
const config = reducer(undefined, {type: "loadConfig", username: program.user || "default"}).get("config").toJS();
const configOverrides = _({username: program.user, debug: program.debug, addUuid: program.addUuid}).omitBy(_.isUndefined).value();
const opts = _.merge({}, config, configOverrides);
_.forEach(program.args, filename => doImport(opts, filename));
