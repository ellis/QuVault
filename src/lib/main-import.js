import _ from 'lodash';
import fs from 'fs';
import jsonfile from 'jsonfile';
import mkdirp from 'mkdirp';
import moment from 'moment';
import path from 'path';
import yaml from 'js-yaml';
import loadConfig from './loadConfig.js';
//import * as userdata from './userdata.js';

const version = "0.1";

function generateUuid() {
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid;
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
	const documentsMissingUuid = _.filter(documents, doc => _.isEmpty(doc.uuid));
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

	// Create problem files
	const problemDir = config.problemDirs[0];
	mkdirp.sync(problemDir);
	//console.log({problemDir})
	for (const problem of documents) {
		const filename = path.join(problemDir, problem.uuid+".json");
		//console.log({filename})
		const content2 = JSON.stringify(problem, null, "\t");
		fs.writeFileSync(filename, content2, "utf8", err => {});
	}
}


const program = require('commander');

program
	.version('0.1')
	.option('-u, --user', 'user name');

program
	.parse(process.argv);

console.log(program)
const config = loadConfig(program.user || "default");
const configOverrides = _({username: program.user, debug: program.debug, addUuid: program.addUuid}).omitBy(_.isUndefined).value();
const opts = _.merge({}, config, configOverrides);
_.forEach(program.args, filename => doImport(opts, filename));
