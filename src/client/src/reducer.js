import {Map, fromJS} from 'immutable';
//import YAML from 'js-yaml';

function setState(state, newState) {
	return state.merge(newState);
}

export default function(state = Map(), action) {
	console.log("action: "+JSON.stringify(action, null, '\t'))
	switch (action.type) {
		case "@@router/LOCATION_CHANGE":
			state = state.set("routing", fromJS(action.payload));
			return state;
		case 'setState':
			return setState(state, action.state);
		case 'reviewShowAnswer':
			state = state.setIn(["ui", "review", "doShowAnswer"], true);
			console.log("state: "+JSON.stringify(state, null, '\t'))
			return state;
	}
	return state;
}
