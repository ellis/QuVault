import express from 'express';
import React from 'react';
import {renderToString} from 'react-dom/server'
import {RoutingContext, match} from 'react-router';
import createLocation from 'history/lib/createLocation';
import routes from 'routes';
import {Provider} from 'react-redux';
import * as reducers from 'reducers';
import promiseMiddleware from 'lib/promiseMiddleware';
import fetchComponentData from 'lib/fetchComponentData';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import path from 'path';

const app = express();

if (process.env.NODE_ENV !== 'production') {
	require('./webpack.dev').default(app);
}

app.use(express.static(path.join(__dirname, 'dist')));

app.use((req, res) => {
	const location = createLocation(req.url);
	const reducer = combineReducers(reducers);
	const map0 = fromJS({"decks": {
                "1355a856-526f-4526-8af5-a8af28f2eccf": {
                        "name": "Algorithms I",
                        "description": "Coursera 2015\n",
                        "new": 6,
                        "pending": 1,
                        "waiting": 3
                },
                "638454be-b564-4b56-ab66-16b6c855ec05": {
                        "name": "Econometrics: Methods and Applications",
                        "description": "Coursera 2016\nEconometrics: Methods and Applications\nby Erasmus University Rotterdam\n",
                        "new": 6,
                        "pending": 0,
                        "waiting": 0
                }
			}});
	const store = applyMiddleware(promiseMiddleware)(createStore)(reducer, map0);

	match({
		routes,
		location
	}, (err, redirectLocation, renderProps) => {
		if (err) {
			console.error(err);
			return res.status(500).end('Internal server error');
		}

		if (!renderProps)
			return res.status(404).end('Not found');

		function renderView() {
			const InitialView = (
				<Provider store={store}>
					<RoutingContext {...renderProps}/>
				</Provider>
			);

			const componentHTML = renderToString(InitialView);

			const initialState = store.getState();

			const HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redux Demo</title>

  <script>
    window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
  </script>
</head>
<body>
  <div id="react-view">${componentHTML}</div>
  <script type="application/javascript" src="/bundle.js"></script>
</body>
</html>
`;

			return HTML;
		}

		fetchComponentData(store.dispatch, renderProps.components, renderProps.params).then(renderView).then(html => res.end(html)).catch(err => res.end(err.message));
	});
});

export default app;
