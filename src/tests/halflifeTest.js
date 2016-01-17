import _ from 'lodash';
import moment from 'moment';
import should from 'should';
import * as Halflife from '../lib/halflife.js';

const scores = [0, 1, 2, 3, 4, 5];

function calcMatrixForHalflife(halflife1) {
	const ts = [1/1440, 1, 7, 30, 90, 365, 365*5];
	const dateText1 = "2000-01-01T00:00:00Z";
	const date1 = moment(dateText1);
	const matrix = _.map(ts, t =>
		_.map(scores, score => {
			const date2 = moment(date1).add(t, "days");
			return Halflife.calcHalflife2(date2.toISOString(), score, dateText1, halflife1);
		})
	);
	return matrix;
}

function calcScoreSequence(score, t=1) {
	const dateText1 = "2000-01-01T00:00:00Z";
	const date1 = moment(dateText1);
	const l = [];
	let t2 = t;
	do {
		t = t2;
		l.push(t);
		const date2 = moment(date1).add(t, "days").add((t*1440)%1440, "minutes");
		//console.log(t)
		//console.log(date2.toISOString())
		t2 = Halflife.calcHalflife2(date2.toISOString(), score, dateText1, t);
	} while (t2 > t)
	return l;
}

describe('halflife', function() {
	describe('calcHalflife2', function() {
		it('should calculate half-lives for new questions', function() {
			should.deepEqual(scores.map(score => Halflife.calcHalflife2("2000-01-01T00:00:00Z", score)),
				[1, 1, 1, 1.3, 2, 4]);
		});
		it('should calculate half-lives when scoring again just a few seconds later', function() {
			should.deepEqual(scores.map(score => Halflife.calcHalflife2("2000-01-01T00:01:00Z", score, "2000-01-01T00:00:00Z", 100)),
				[1, 1, 1, 100, 100, 100]);
		});
		it('should calculate half-lives for halflife1 = t = 100', function() {
			should.deepEqual(scores.map(score => Halflife.calcHalflife2("2000-04-10T00:00:00Z", score, "2000-01-01T00:00:00Z", 100)),
				[1, 50, 70, 130, 200, 400]);
		});
		it("should calculate half-lives for a sequence of score=3", function() {
			const l = calcScoreSequence(3);
			//console.log(JSON.stringify(l));
			should.deepEqual(l, [1, 1.3, 1.69, 2.2, 2.86, 3.72, 4.84, 6.29, 8.18, 10.6, 13.8, 17.9, 23.3, 30.3, 39.4, 51.2, 66.6, 86.6, 113, 147, 191, 248, 322, 419, 545, 709, 922, 1200, 1560, 1830]);
		});
		it("should calculate half-lives for a sequence of score=4", function() {
			const l = calcScoreSequence(4);
			//console.log(JSON.stringify(l));
			should.deepEqual(l, [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1020, 1830]);
		});
		it("should calculate half-lives for a sequence of score=5", function() {
			const l = calcScoreSequence(5);
			//console.log(JSON.stringify(l));
			should.deepEqual(l, [1, 4, 16, 64, 256, 1020, 1830]);
		});
		it("should calculate matrix for halflife=1", function() {
			should.deepEqual(calcMatrixForHalflife(1), [
				[ 1, 1, 1, 1, 1, 1 ],
				[ 1, 1, 1, 1.3, 2, 4 ],
				[ 1, 1, 1, 9.1, 14, 28 ],
				[ 1, 1, 1, 39, 60, 120 ],
				[ 1, 1, 1, 117, 180, 360 ],
				[ 1, 1, 1, 475, 730, 1460 ],
				[ 1, 1, 1, 1830, 1830, 1830 ]
			]);
		});
		it("should calculate matrix for halflife=7", function() {
			const matrix = calcMatrixForHalflife(7);
			//console.log(matrix);
			should.deepEqual(matrix, [
				[ 1, 1, 1, 7, 7, 7 ],
				[ 1, 1, 1, 7, 7, 7 ],
				[ 1, 3.5, 4.9, 9.1, 14, 28 ],
				[ 1, 7, 7, 39, 60, 120 ],
				[ 1, 7, 7, 117, 180, 360 ],
				[ 1, 7, 7, 475, 730, 1460 ],
				[ 1, 7, 7, 1830, 1830, 1830 ]
			]);
		});
		it("should calculate matrix for halflife=30", function() {
			const matrix = calcMatrixForHalflife(30);
			//console.log(matrix);
			should.deepEqual(matrix, [
				[ 1, 1, 1, 30, 30, 30 ],
				[ 1, 1, 1, 30, 30, 30 ],
				[ 1, 3.5, 4.9, 30, 30, 30 ],
				[ 1, 15, 21, 39, 60, 120 ],
				[ 1, 30, 30, 117, 180, 360 ],
				[ 1, 30, 30, 475, 730, 1460 ],
				[ 1, 30, 30, 1830, 1830, 1830 ]
			]);
		});
	});
});
