import React                   from 'react';
import { Route, IndexRoute }   from 'react-router';
import App                     from 'components/index';
import Home                    from 'components/Home';
import Decks from './components/Decks.jsx';

export default (
	<Route name="app" component={App} path="/">
		// <IndexRoute component={Home}/>
		<IndexRoute component={Decks}/>
	</Route>
);
