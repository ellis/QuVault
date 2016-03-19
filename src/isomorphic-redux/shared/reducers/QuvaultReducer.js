import Immutable from 'immutable';

const defaultState = new Immutable.Map();

export default function quvaultReducer(state = defaultState, action) {
	switch (action.type) {
		case 'GET_DECKS':
			return state.setIn(["data", "decks"], Immutable.fromJS(action.res.data));
		case 'GET_QUESTION':
			return state.setIn(["ui", "question", "data"], Immutable.fromJS(action.res.data));
		default:
			return state;
	}
}
