import {List, Map, fromJS} from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

function setConnectionState(state, connectionState, connected) {
  return state.set('connection', Map({
    state: connectionState,
    connected
  }));
}

function setState(state, newState) {
  return state.set("data", fromJS(newState));
}

export default function(state = Map(), action) {
  console.log("action:"+JSON.stringify(action))
  switch (action.type) {
  case LOCATION_CHANGE:
    return state.set("routing", fromJS(action.payload));
  case 'SET_CLIENT_ID':
    return state.set('clientId', action.clientId);
  case 'SET_CONNECTION_STATE':
    return setConnectionState(state, action.state, action.connected);
  case 'SET_STATE':
    return setState(state, action.state);
	case "setQuesitonText":
		return state.setIn(["ui", "review"], Map({questionText: action.questionText}));
  }
  console.log({state})
  return state;
}
