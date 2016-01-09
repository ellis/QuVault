import _ from 'lodash';
import moment from 'moment';

const scoreToRecall = c(0.05, 0.20, 0.40, 0.60, 0.80, 0.95);

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
