import _ from 'lodash';
import should from 'should';
import * as M from '../lib/Medley.js';

describe('Medley', function() {
	describe('setMut', function() {
		it('should set non-empty paths with non-null values', function() {
			should.deepEqual(M.setMut({}, ["a", "b", "c"], 1), {
				a: {b: {c: 1}}
			});
			should.deepEqual(M.setMut({a: {b: {c: 1}}}, ["a", "b", "d"], 2), {
				a: {b: {c: 1, d: 2}}
			});
		});
	});
});
