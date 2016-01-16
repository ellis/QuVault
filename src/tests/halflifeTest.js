import _ from 'lodash';
import moment from 'moment';
import should from 'should';
import * as Halflife from '../lib/halflife.js';

describe('halflife', function() {
	describe('calcHalflife2', function() {
		it('should calculate half-lives for new questions', function() {
			should.deepEqual([0, 1, 2, 3, 4, 5].map(score => Halflife.calcHalflife2("2000-01-01T00:00:00Z", score)),
				[1, 1, 1, 1.3, 2, 4]);
		});
		it('should calculate half-lives when scoring again just a few seconds later', function() {
			should.deepEqual([0, 1, 2, 3, 4, 5].map(score => Halflife.calcHalflife2("2000-01-01T00:01:00Z", score, "2000-01-01T00:00:00Z", 100)),
				[1, 1, 1, 100, 100, 100]);
		});
		it('should calculate half-lives for halflife1 = t = 100', function() {
			should.deepEqual([0, 1, 2, 3, 4, 5].map(score => Halflife.calcHalflife2("2000-04-10T00:00:00Z", score, "2000-01-01T00:00:00Z", 100)),
				[1, 50, 70, 130, 200, 400]);
		});
		it("should calculate half-lives when score=5 over a range of halflife1 and t", function() {
			const halflives = [1, 7, 30, 90, 365, 365*5];
			const ts = [1/1440, 1, 7, 30, 90, 365, 365*5];
			const score = 5;
			const dateText1 = "2000-01-01T00:00:00Z";
			const date1 = moment(dateText1);
			const matrix = _.map(halflives, halflife1 =>
				_.map(ts, t => {
					const date2 = moment(date1).add(t, "days");
					return Halflife.calcHalflife2(date2.toISOString(), score, dateText1, halflife1);
				})
			);
			console.log(matrix)
		});
	});
});
