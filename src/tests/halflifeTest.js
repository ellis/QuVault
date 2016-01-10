import _ from 'lodash';
import should from 'should';
import * as Halflife from '../lib/halflife.js';

describe('halflife', function() {
	describe('calcHalflife2', function () {
		it('should calculate half-lives for new questions', function () {
			should.equal(Halflife.calcHalflife2("2000-01-01T00:00:00Z", 5), 13.513407333964873);
			should.equal(Halflife.calcHalflife2("2000-01-01T00:00:00Z", 4), 3.1062837195053903);
			should.equal(Halflife.calcHalflife2("2000-01-01T00:00:00Z", 3), 1.3569154488567239);
			should.equal(Halflife.calcHalflife2("2000-01-01T00:00:00Z", 2), 0.7564707973660302);
			should.equal(Halflife.calcHalflife2("2000-01-01T00:00:00Z", 1), 0.43067655807339306);
			should.equal(Halflife.calcHalflife2("2000-01-01T00:00:00Z", 0), 0.23137821315975915);
		});
		it('should calculate half-lives for a recently failed question', function () {
			should.equal(Halflife.calcHalflife2("2000-01-01T00:01:00Z", 5, "2000-01-01T00:00:00Z", 0.23), 0.23);
			should.equal(Halflife.calcHalflife2("2000-01-01T00:01:00Z", 4, "2000-01-01T00:00:00Z", 0.23), 0.23);
			should.equal(Halflife.calcHalflife2("2000-01-01T00:01:00Z", 3, "2000-01-01T00:00:00Z", 0.23), 0.23);
			should.equal(Halflife.calcHalflife2("2000-01-01T00:01:00Z", 2, "2000-01-01T00:00:00Z", 0.23), 0.23);
			should.equal(Halflife.calcHalflife2("2000-01-01T00:01:00Z", 1, "2000-01-01T00:00:00Z", 0.23), 0.23);
			should.equal(Halflife.calcHalflife2("2000-01-01T00:01:00Z", 0, "2000-01-01T00:00:00Z", 0.23), 0.23);
		});
	});
});
