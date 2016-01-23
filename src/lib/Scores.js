import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import LineByLineReader from 'n-readlines';
import * as Halflife from './halflife.js';
import * as M from './Medley.js'

export function load(dir) {
	const data = {};
	if (fs.existsSync(dir)) {
		// Filenames in the directory
		const filenames = fs.readdirSync(dir);
		filenames.sort();

		// Load data from all files
		_.forEach(filenames, filename => {
			const ext = path.extname(filename);
			switch (ext) {
				case ".rec1":
					processFile(path.join(dir, filename), data);
					break;
			}
		});
	}
	//calcHalflives(data);
	return data;
}

/**
 * Process a user's response file and update the question data object.
 *
 * The format of input files is expected to be
 *
 * ``[UUID, index, date, score, optional response, optional double-check-period, optional forced-half-life]``
 *
 * The question data object has as key question IDs (i.e. UUID or UUID/index).
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
		const [uuid, index, dateText, score] = l;
		const id = (_.isNull(index)) ? uuid : `${uuid}/${index}`;

		//_.set(data, [id, "uuid"], uuid);
		//_.set(data, [id, "index"], index);

		// Update history
		//const historyPath = [id, "history"];
		//console.log(historyPath)
		//const history = _.get(data, historyPath, []);
		//history.push(_.drop(l, 2));
		console.log(data);
		console.log({uuid, index, dateText, score})
		M.setMut(data, [uuid, index, dateText], {score});
		//_.set(data, historyPath, history);
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
