import {Map, fromJS} from 'immutable';
//import YAML from 'js-yaml';

function setState(state, newState) {
	return state.merge(newState);
}

export default function(state = Map(), action) {
	switch (action.type) {
		case 'setState':
			return setState(state, action.state);
		case 'reviewShowAnswer':
			state = state.setIn(["ui", "review", "doShowAnswer"], true);
			console.log("state: "+JSON.stringify(state, null, '\t'))
			return state;
	}
	return state;
}
