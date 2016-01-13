import _ from 'lodash';
import should from 'should';
import * as Halflife from '../lib/halflife.js';

describe('halflife', function() {
	describe('calcHalflife2', function () {
		it('should calculate half-lives for new questions', function () {
			should.deepEqual([5, 4, 3, 2, 1, 0].map(score => Halflife.calcHalflife2("2000-01-01T00:00:00Z", score)),
				[14, 3.1, 1.4, 0.75, 0.43, 0.23]);
		});
		it('should calculate half-lives for a recently failed question', function () {
			should.deepEqual([5, 4, 3, 2, 1, 0].map(score => Halflife.calcHalflife2("2000-01-01T00:01:00Z", score, "2000-01-01T00:00:00Z", 0.23)),
				[]);
		});
	});
});
