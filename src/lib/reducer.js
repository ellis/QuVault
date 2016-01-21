import _ from 'lodash';
import assert from 'assert';
import {List, Map} from 'immutable';
import Immutable from 'immutable';

import StateWrapper, {initialState} from './StateWrapper.js';

const handlers = {
	'@@redux/INIT': () => {},

	deckCreate: (builder, action) => {
		const desktopId = builder.findDesktopIdByNum(action.desktop);
		builder.activateDesktop(desktopId);
	},
};

export default function reducer(state = initialState, action) {
	//logger.info("reducer: "+JSON.stringify(action));

	const handler = handlers[action.type];
	if (handler) {
		try {
			const builder = new StateWrapper(state);
			builder.check();
			handler(builder, action);
			updateLayout(builder);
			updateX11(builder);
			builder.check();
			return builder.getState();
		}
		catch (e) {
			logger.error(e.message);
			logger.error(e.stack);
		}
	}

	else {
		//logger.warn("reducer: unknown action", action);
	}
	return state;
}
