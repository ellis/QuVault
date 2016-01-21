import _ from 'lodash';
import assert from 'assert';
import {List, Map} from 'immutable';
import Immutable from 'immutable';

import StateWrapper, {initialState} from './StateWrapper.js';

const handlers = {
	'@@redux/INIT': () => {},

	createDeck: (builder, action) => {
		builder.createDeck(action.uuid, action.name, action.parent, action.after);
	},

	addProblemsToDeck: (builder, action) => {
		builder.addProblemsToDeck(action.problems, action.deck);
	},
};

export default function reducer(state = initialState, action) {
	//logger.info("reducer: "+JSON.stringify(action));
	//console.log({state, action})

	const handler = handlers[action.type];
	if (handler) {
		try {
			const builder = new StateWrapper(state);
			builder.check();
			handler(builder, action);
			builder.check();
			return builder.getState();
		}
		catch (e) {
			console.log(e.message);
			console.log(e.stack);
		}
	}

	else {
		console.log("reducer: unknown action", action);
	}
	return state;
}
