import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import LineByLineReader from 'n-readlines';

/**
 * Format of input files is expected to be
 *
 * ``[UUID, index, date, score, optional response, optional double-check-period, optional forced-half-life]``
 *
 * @param  {[type]} filename [description]
 * @param  {[type]} data     =             {} [description]
 * @return {[type]}          [description]
 */
export function processFile(filename, data = {}) {
	console.log(`processFile(${filename})`)
	const lr = new LineByLineReader(filename);

	let line;
	while (line = lr.next()) {
		const s = line.toString('utf8');
		const l = JSON.parse(s);
		const [uuid, index] = l;
		const historyPath = [uuid, index, "history"];
		console.log(historyPath)
		const history0 = _.get(data, historyPath, []);
		const history1 = history0.concat([_.drop(l, 2)]);
		_.set(data, historyPath, history1);
		console.log();
	}
}

export function loadUserdata(username) {
	const userdir = path.join("userdata", username);
	// Load all json files into a map to a list of
	const filenames0 = fs.readdirSync(userdir);
	// The files should be named in order of processing,
	// so sort the array so that we can directly update the item list
	var filenames = _.filter(filenames0, function(filename) { return path.extname(filename) === ".rec1" });
	filenames.sort();

	const data = {};
	for (const filename of filenames) {
		processFile(path.join(userdir, filename), data);
		//fs.readFileSync(path.join(userdir, filename), "utf8")
		//var contents = JSON.parse();
		//applyPatch(item_m, contents);
	}

	return data;
}
