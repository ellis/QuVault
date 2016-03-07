import {List, Map, fromJS} from 'immutable';
import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory} from 'react-router';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
//import {syncHistoryWithStore} from 'react-router-redux';
import io from 'socket.io-client';
import reducer from './reducer';
import {setClientId, setState, setConnectionState} from './action_creators';
import remoteActionMiddleware from './remote_action_middleware';
import getClientId from './client_id';
import App from './components/App';
import {DecksContainer} from './components/Decks';
import {ReviewContainer} from './components/Review';

require('./style.css');

const createStoreWithMiddleware = applyMiddleware(remoteActionMiddleware(socket))(createStore);
const store = createStoreWithMiddleware(reducer);
store.dispatch(setClientId(getClientId()));

const socket = io(`${location.protocol}//${location.hostname}:12346`);
socket.on('state', state => store.dispatch(setState(state)));
socket.on("question", result => {
	store.dispatch({type: "setQuestionText", format: result.format, data: result.data});
});
[
	'connect',
	'connect_error',
	'connect_timeout',
	'reconnect',
	'reconnecting',
	'reconnect_error',
	'reconnect_failed'
].forEach(ev => socket.on(ev, () => store.dispatch(setConnectionState(ev, socket.connected))));


/*
// Create an enhanced history that syncs navigation events with the store
function selectLocationState(state) {
	//return state.routing;
	//console.log(state);
	console.log("routing: "+state.get("routing", Map()).toString());
	return state.get("routing", Map()).toJS();
}
const history = syncHistoryWithStore(hashHistory, store, {selectLocationState});

const routes = <Route component={App}>
	<Route path="/" component={DecksContainer} />
	<Route path="/review" component={DecksContainer} />
</Route>;

ReactDOM.render(
	<Provider store={store}>
		<Router history={history}>{routes}</Router>
	</Provider>,
	document.getElementById('app')
);
*/

const rxDecks = /^#\/$/;
const rxReview0 = /^#\/review$/;
function navigated() {
	console.log(`navigated: ${window.location.hash}`)
	console.log({a: rxDecks.test(window.location.hash)})

	// Choose which component to render based on browser URL
	const hash = window.location.hash;
	const container
		= (hash === "") ? DecksContainer
		: (rxDecks.test(hash)) ? DecksContainer
		: (rxReview0.test(hash)) ? setupReview()
		: undefined;
	const component = (container)
		? React.createElement(container)
		: React.createElement("div", {}, "Not found");

	// Render the new component to the page's #react-app element
	ReactDOM.render(
		<Provider store={store}>{component}</Provider>,
		document.getElementById('app')
	);
}

function setupReview() {
	let deckUuid = undefined;
	let state = store.getState();
	const orderItem = state.getIn(["data", "order"], List()).find(x => {
		if (x.get("weight") < 1) return false;
		if (!deckUuid) return true; // choose first item in order list
		//console.log({x, path: ["problems", x.problemUuid, "decks", deckUuid], value: state.getIn(["problems", x.problemUuid, "decks", deckUuid])});
		return state.getIn(["data", "problems", x.get("problemUuid"), "decks", deckUuid], false) === true;
	});
	if (!orderItem) {
		// Show component saying that there's nothing left to review
	}
	else {
		const problemUuid = orderItem.get("problemUuid");
		const index = orderItem.get("index");
		console.log("question", {problemUuid, index});
		socket.emit("question", {problemUuid, index});
	}
	console.log({deckUuid, orderItem})
	return ReviewContainer;
}

// Handle the initial route
navigated();

// Handle browser navigation events
window.addEventListener('hashchange', navigated, false);
