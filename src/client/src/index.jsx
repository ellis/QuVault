import React from 'react';
import ReactDOM from 'react-dom';
//import {IndexRoute, Route, Router, browserHistory} from 'react-router';
import {Route, Router} from 'react-router';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import App from './components/App';
//import {DesignContainer} from './components/Design';
import {DecksContainer} from './components/Decks';
import Results from './components/Results';
import {ReviewContainer} from './components/Review';
import {VotingContainer} from './components/Voting';

const store = createStore(reducer);
store.dispatch({
	type: 'setState',
	state: {
		data: {
			decks: {
				"1355a856-526f-4526-8af5-a8af28f2eccf": {
					"name": "Algorithms I",
					"description": "Coursera 2015\n",
					"new": 7,
					"pending": 3,
					"waiting": 1
				},
				"638454be-b564-4b56-ab66-16b6c855ec05": {
					"name": "Econometrics: Methods and Applications",
					"description": "Coursera 2016\nEconometrics: Methods and Applications\nby Erasmus University Rotterdam\n",
					"new": 6,
					"pending": 0,
					"waiting": 0
				},
				"712541ae-9731-4973-ac71-9ec75161d662": {
					"name": "Introduction to Marketing",
					"description": "Coursera 2015\nIntroduction to Marketing\nby University of Pennsylvania\nProfessors Barbara Kahn, Peter Fader, and David Bell\n",
					"notes": "Still need to finish questions for:\n\n* Week 4\n",
					"new": 53,
					"pending": 0,
					"waiting": 0
				},
				"d387c0e1-d9f3-4d9f-b197-7319e6138819": {
					"name": "Financial Evaluation and Strategy: Investments",
					"description": "* Coursera 2015\n* Financial Evaluation and Strategy: Investments\n* University of Illinois at Urbana-Champaign\n* Professor Scott Weisbenner\n",
					"new": 0,
					"pending": 1,
					"waiting": 13
				},
				"fb9304cf-ac9e-4ac9-82b7-702baad2eec1": {
					"name": "Introduction to Financial Accounting",
					"description": "Coursera 2016\nIntroduction to Financial Accounting\nby University of Pennsylvania\nProfessor Brian J Bushee\n",
					"notes": "Still need to write questions for:\n* 2.6\n* 3.2.2\n* 3.3.2\n* 3.4\n* 4.2 (programming, not questions)\n* 4.3\n",
					"new": 127,
					"pending": 4,
					"waiting": 2
				}
			}
		},
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
			<Route path="/review" component={ReviewContainer}/>
			<Route path="/" component={DecksContainer}/>
		</Route>
	</Router>
);

ReactDOM.render(<Provider store={store}>{router}</Provider>, document.getElementById('app'));
