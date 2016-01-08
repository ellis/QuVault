import _ from 'lodash';
import moment from 'moment';

/**
 * Calculate the current expected half-life given a history of question responses.
 *
 * The response format is ``[date, score, optional response, optional double-check-period, optional forced-half-life]``.
 * The important field
 *
 * @param  {array} history - array w
 * @return {[type]}         [description]
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
		if (datePrev) {
			date.diff(datePrev, 'days', true);
		}
		/*
		 * Adjust $T$ as follows:
		 * * If the actual score is >= 3:
		 *     * If the actual score is higher than the expected score:
		 *         * $T = T \cdot (actual - expected + 1)$
		 *     * If the actual score is lower than the expected score, $T /= (actual - expected + 1)$
		 *     * Otherwise, leave $T$ unchanged
		 * * Otherwise the actual score is <= 2:
		 */
		if (score >= 3) {
			CONTINUE
		}
	});
}
