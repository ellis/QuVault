import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import LineByLineReader from 'n-readlines';
import * as Halflife from '../lib/halflife.js';

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
	calcHalflives(data);

	return data;
}

/**
 * Process a user's response file and update the question data object.
 *
 * The format of input files is expected to be
 *
 * ``[UUID, index, date, score, optional response, optional double-check-period, optional forced-half-life]``
 *
 * The question data object is has as key question IDs (i.e. UUID or UUID/index).
 * Each key has these field: 'uuid', 'index', 'history'.
 *
 * This function mutates @param data.
 *
 * @param  {string} filename - path to a response file
 * @param  {object} data - user response map (keys are question IDs)
 */
export function processFile(filename, data = {}) {
	console.log(`processFile(${filename})`)
	const lr = new LineByLineReader(filename);

	let line;
	while (line = lr.next()) {
		const s = line.toString('utf8');
		const l = JSON.parse(s);
		const [uuid, index] = l;
		const id = (_.isNull(index)) ? uuid : `${uuid}/${index}`;

		_.set(data, [id, "uuid"], uuid);
		_.set(data, [id, "index"], index);

		// Update history
		const historyPath = [id, "history"];
		console.log(historyPath)
		const history = _.get(data, historyPath, []);
		history.push(_.drop(l, 2));
		_.set(data, historyPath, history);

		console.log();
	}
}

export function calcHalflives(userdata) {
	_.forEach(userdata, qdata => {
		let dateText1;
		let halflife1;
		const halflives = [];
		qdata.halflives = _.map(qdata.history, ([dateText2, score2]) => {
			halflife1 = Halflife.calcHalflife2(dateText2, score2, dateText1, halflife1);
			dateText1 = dateText2;
			return halflife1;
		});
	});
}
