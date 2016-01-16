import _ from 'lodash';
import moment from 'moment';

const scoreToRecall = [0.05, 0.20, 0.40, 0.60, 0.80, 0.95];

export function calcHalflife2(dateText2, score2, dateText1 = undefined, halflife1 = 1) {
	const date1 = (dateText1) ? moment(dateText1) : undefined;
	const date2 = moment(dateText2);
	// Time since previous score
	const t = (date1) ? date2.diff(date1, 'days', true) : 1;

	const halflife2a
		= (score2 === 5) ? Math.max(t*4, halflife1)
		: (score2 === 4) ? Math.max(t*2, halflife1)
		: (score2 === 3) ? Math.max(t*1.3, halflife1)
		: (score2 === 2) ? Math.min(t*0.7, halflife1)
		: (score2 === 1) ? Math.min(t*0.5, halflife1)
		: 1;

	const halflife2b = Math.min(365*5, Math.max(halflife2a, 1));

	//console.log({halflife1, date1: dateText1, date2: date2.toISOString(), t, halflife2a, halflife2b})

	return Number(halflife2b.toPrecision(2));
}

/*export function calcHalflife2(dateText2, score2, dateText1 = undefined, halflife1 = 1) {
	const date1 = (dateText1) ? moment(dateText1) : undefined;
	const date2 = moment(dateText2);
	// Time since previous score
	const t = (date1) ? date2.diff(date1, 'days', true) : 1;

	const halflife2a = calcHalflife2b(t, score2, halflife1);

	// Time that should have ellapsed since previous response,
	// in order to switch halflife completely to halflife2.
	const tFull = Math.max(1, halflife1);
	// Attenuation factor: if t is less than a day,
	const factor
		= (t >= tFull) ? 1
		: t/tFull;
	// Interpolate between the old and new half-lives
	const halflife2b = (1 - factor) * halflife1 + factor * halflife2a;
	const halflife2c = Math.max(halflife2b, 1/1440);
	//console.log({halflife2a, halflife2b, halflife2c})
	return Number(halflife2c.toPrecision(2));
}*/

function calcHalflife2b(t, score2, halflife1) {
	// Calculate the expected recall fraction (between 0 and 1)
	/*const recallExpected = Math.pow(2, -t / halflife1);
	const scoreExpected
		= (recallExpected >= 0.90) ? 5
		: (recallExpected >= 0.70) ? 4
		: (recallExpected >= 0.50) ? 3
		: (recallExpected >= 0.30) ? 2
		: (recallExpected >= 0.10) ? 1
		: 0;
	console.log({t, halflife1, recallExpected, scoreExpected, score2});*/
	const recall = scoreToRecall[score2];
	//console.log({score2, recall, t});
	// Calculate updated half-life, only based on recall and time since last response
	const halflife2a = -t / Math.log2(recall);
	// Handle different cases by score:
	if (score2 === 0) {
		return Math.min(1, t * 0.25);
	}
	else if (score2 === 1) {
		return Math.min(30, t * 0.50);
	}
	else if (score2 === 2) {
		return Math.min(t * 0.75, halflife1 * 0.75);
	}
	// If user answered correctly:
	else {
		return halflife2a;
	}
}

/**
 * Calculate the current expected half-life given a history of question responses.
 *
 * The response format is ``[date, score, optional response, optional double-check-period, optional forced-half-life]``.
 * The important fields are date and score.
 *
 * @param  {array} history - array from response history
 * @return {number} expected half-life of recall
 */
export function calcHalfLife(history) {
	assert(_.isArray(history));
	// With no history, assume a 50% probability of still remembering in 1 day.
	if (_.isEmpty(history)) {
		return 1;
	}

	let TPrev = 1;
	let datePrev;
	history.forEach(l => {
		const [dateText, score] = l;
		const date = moment(dateText);
		// Time since previous score
		const t = (datePrev) ? date.diff(datePrev, 'days', true) : 1;
		// Calculate the expected recall fraction (between 0 and 1)
		const recallExpected = Math.pow(2, -t / TPrev);
		const scoreExpected
			= (recallExpected > 90) ? 5
			: (recallExpected > 70) ? 4
			: (recallExpected > 50) ? 3
			: (recallExpected > 30) ? 2
			: (recallExpected > 10) ? 1
			: 0;
		if (score != scoreExpected) {
			const recall = scoreToRecall[score];
			const T = -t / Math.log2(recall)
			TPrev = T;
		}
	});
	return TPrev;
}
