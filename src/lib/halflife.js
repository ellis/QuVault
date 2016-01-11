import _ from 'lodash';
import moment from 'moment';

const scoreToRecall = [0.05, 0.20, 0.40, 0.60, 0.80, 0.95];

export function calcHalflife2(dateText2, score2, dateText1 = undefined, halflife1 = 1) {
	const date1 = (dateText1) ? moment(dateText1) : undefined;
	const date2 = moment(dateText2);
	// Time since previous score
	const t = (date1) ? date2.diff(date1, 'days', true) : 1;
	// Calculate the expected recall fraction (between 0 and 1)
	const recallExpected = Math.pow(2, -t / halflife1);
	const scoreExpected
		= (recallExpected >= 0.90) ? 5
		: (recallExpected >= 0.70) ? 4
		: (recallExpected >= 0.50) ? 3
		: (recallExpected >= 0.30) ? 2
		: (recallExpected >= 0.10) ? 1
		: 0;
	console.log({t, halflife1, recallExpected, scoreExpected});
	if (date1 && score2 === scoreExpected) {
		return halflife1;
	}
	else {
		const recall = scoreToRecall[score2];
		//console.log({score2, recall, t});
		// Calculate updated half-life, only based on recall and time since last response
		const halflife2a = -t / Math.log2(recall);
		// If user answered correctly:
		if (score2 >= 3) {
			// Always allow a decrease in half-life
			if (halflife2a < halflife1) {
				return halflife2a;
			}
			// If halflife should increase
			else {
				// Time that should have ellapsed since previous response,
				// in order to switch halflife completely to halflife2.
				const tFull = Math.max(1, halflife1);
				// Attenuation factor: if t is less than a day,
				const factor
					= (t >= tFull) ? 1
					: t/tFull;
				// Interpolate between the old and new half-lives
				const halflife2 = (1 - t) * halflife1 + t * halflife2a;
				return halflife2;
			}
		}
		// Otherwise the user didn't give the right answer:
		else {
			const halflife2b
				= (score2 === 2) ? halflife1 * 0.75
				: (score2 === 1) ? halflife1 * 0.50
				: Math.min(1, halflife1 * 0.25);
			const halflife2 = Math.max(Math.min(halflife2a, halflife2b), 1/1440);
			return halflife2;
		}
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
