import React from 'react';
import ReactDOM from 'react-dom';
//import {IndexRoute, Route, Router, browserHistory} from 'react-router';
import {Route, Router} from 'react-router';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import App from './components/App';
//import {DesignContainer} from './components/Design';
import Results from './components/Results';
import {ReviewContainer} from './components/Review';
import {VotingContainer} from './components/Voting';

const store = createStore(reducer);
store.dispatch({
	type: 'setState',
	state: {
		ui: {
			review: {
				questionText: "What's my name?",
				doShowAnswer: false
			}
		}
	}
});

const pair = ['Trainspotting', '28 Days Later'];

/*
const router = (
	<Router>
		<Route path="/" component={App}>
			<IndexRoute component={Results}/>
			<Route path="voting" component={Voting}/>
			// <Route path="results" component={Results}/>
		</Route>
	</Router>
);
*/
const router = (
	<Router>
		<Route component={App}>
			<Route path="/" component={ReviewContainer}/>
		</Route>
	</Router>
);

ReactDOM.render(<Provider store={store}>{router}</Provider>, document.getElementById('app'));
