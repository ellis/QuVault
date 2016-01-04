import fs from 'fs';
import path from 'path';

function processFile(inputFile) {
	var fs = require('fs'),
	readline = require('readline'),
	instream = fs.createReadStream(inputFile),
	outstream = new (require('stream'))(),
	rl = readline.createInterface(instream, outstream);

	rl.on('line', function (line) {
	console.log(line);
	});

	rl.on('close', function (line) {
	console.log(line);
	console.log('done reading file.');
	});
}

export function loadUserdata(username) {
	const userdir = path.join("userdata", username);
	// Load all json files into a map to a list of
	const filenames0 = fs.readdirSync(userdir);
	// The files should be named in order of processing,
	// so sort the array so that we can directly update the item list
	var filenames = _.filter(filenames0, function(filename) { return path.extname(filename) === ".rec1" });
	filenames.sort();

	var item_m = {};
	for (const filename of filenames) {
		fs.readFileSync(path.join(userdir, filename), "utf8")
		var contents = JSON.parse();
		applyPatch(item_m, contents);
	});

	return item_m;
}
