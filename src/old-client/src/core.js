import _ from 'lodash';
import Immutable, {List, Map, fromJS} from 'immutable';
import moment from 'moment';
import random from 'random-js';

export function refreshReviewOrder(state) {
	//console.log("calcReviewList")
	const mt = random.engines.mt19937();
	mt.autoSeed();
	const weights = [];
	state.get("problems", Map()).forEach((problemData, problemUuid) => {
		//console.log({problemData, problemUuid})
		problemData.get("questions", Map()).forEach((questionData, index) => {
			//console.log({questionData, index})
			const scoreDates = _.keys(questionData.get("history", Map()).toJS());
			//console.log({scoreDates, json: JSON.stringify(scoreDates)})
			let weight = 1;
			let randWeight = 1;
			let status;
			// If the question is new:
			if (scoreDates.length === 0) {
				status = "new";
			}
			// If the question is on the skip list:
			else if (state.getIn(["skipList", problemUuid, index.toString()], false)) {
				weight = 0;
				randWeight = 0;
				status = "waiting";
			}
			else {
				const lastDateText = _.max(scoreDates);
				const lastDate = moment(lastDateText);
				const now = moment();
				const halflife = questionData.get("halflife", 1);
				const diff = now.diff(lastDate, 'minutes') / (24*60);
				weight = diff / halflife;
				//console.log({lastDateText, now, halflife, diff, weight})
				// Randomly shift the weight between 90% and 110%
				const factor = random.real(-0.1, 0.1, true)(mt);
				randWeight = (1 + factor) * weight;
				status = (weight >= 1) ? "pending" : "waiting";
			}
			weights.push([problemUuid, index, weight, randWeight, status]);
		});
	});
	const l0 = _.sortBy(weights, x => -x[3]);
	const l1 = l0.map(([problemUuid, index, weight, , status]) => { return {problemUuid, index, weight, status}; });
	//const deckOrders = {};
	const deckProblemCounts = {};
	_.forEach(l1, ({problemUuid, index, status}) => {
		const decks = state.getIn(["problems", problemUuid, "decks"], Map());
		decks.forEach((x, deckUuid) => {
			/*const l2 = deckOrders[deckUuid] || [];
			l2.push({problemUuid, index, status});
			deckOrders[deckUuid] = l2;*/
			if (!deckProblemCounts.hasOwnProperty(deckUuid)) {
				deckProblemCounts[deckUuid] = {new: 0, pending: 0, waiting: 0};
			}
			const path = [deckUuid, status];
			_.set(deckProblemCounts, path, _.get(deckProblemCounts, path, 0) + 1);
		});
	});
	/*_.forEach(deckOrders, (x, deckUuid) => {
		state = state.setIn(["decks", deckUuid, "order"], fromJS(_.map(x, x => [x.problemUuid, x.index])));
	});*/
	state = state.mergeDeepIn(["decks"], fromJS(deckProblemCounts));
	state = state.set("order", fromJS(l1));

	return state;
}
