import _ from 'lodash';
import should from 'should';
import * as Halflife from '../lib/halflife.js';

describe('halflife', function() {
	describe('calcHalflife2', function () {
		it('should calculate half-lives for new questions', function () {
			should.deepEqual([5, 4, 3, 2, 1, 0].map(score => Halflife.calcHalflife2("2000-01-01T00:00:00Z", score)),
				[14, 3.1, 1.4, 0.75, 0.5, 0.25]);
		});
		it('should calculate half-lives when scoring again just a few seconds later', function () {
			should.deepEqual([5, 4, 3, 2, 1, 0].map(score => Halflife.calcHalflife2("2000-01-01T00:01:00Z", score, "2000-01-01T00:00:00Z", 0.23)),
				[0.23, 0.23, 0.23, 0.23, 0.23, 0.23]);
		});
		it('should calculate half-lives for quesiton after previous half-life has passed', function () {
			should.deepEqual([5, 4, 3, 2, 1, 0].map(score => Halflife.calcHalflife2("2000-04-10T00:00:00Z", score, "2000-01-01T00:00:00Z", 100)),
				[1400, 310, 140, 75, 30, 1]);
		});
	});
});
