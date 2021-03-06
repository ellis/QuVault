import _ from 'lodash';
import assert from 'assert';

export function setMut(data, path, value) {
	assert(_.isPlainObject(data));
	assert(_.isArray(path) || _.isString(path));

	path = (_.isArray(path)) ? path : [path];

	// If the path should be deleted
	if (_.isNull(value) || _.isUndefined(value)) {
		delMut(data, path);
	}
	// If path is empty, set the value itself
	else if (_.isEmpty(path)) {
		assert(_.isPlainObject(value));
		_.merge(data, value);
	}
	else {
		const pathPresent = [];
		let dataPresent = data;
		for (let i = 0; i < path.length - 1; i++) {
			const name = path[i];
			//console.log({i, name, dataPresent})
			if (!dataPresent.hasOwnProperty(name)) {
				dataPresent[name] = {};
			}
			dataPresent = dataPresent[name];
		}
		//console.log({dataPresent})
		dataPresent[_.last(path)] = value;
	}

	return data;
}

export function getMut(data, path, dflt) {
	return _.get(data, path, dflt);
}
