import React                   from 'react';
import { Route, IndexRoute }   from 'react-router';
import App                     from 'components/index';
import Decks from './components/Decks.jsx';
import Question from './components/Question.jsx';

export default (
	<Route name="app" component={App} path="/">
		<IndexRoute component={Decks}/>
		<Route path="question/:problemUuid/:index" component={Question}/>
	</Route>
);
