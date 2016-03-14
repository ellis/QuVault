// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
import {Map} from 'immutable';

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests,
// e.g. user authentication
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/decks')
	.get((req, res) => {
		var reducer = require('../lib/reducer.js').default;
		const actions = [
			{type: "loadConfig", username: "default"},
			{type: "loadDecks"}
		];
		const state = actions.reduce(reducer, Map());
		//console.log(JSON.stringify(state.toJS(), null, '\t'))
		res.json(state.getIn(["decks"], Map()).toJS());
	});

router.route('/u/:username/decks')
	.get((req, res) => {
		var reducer = require('../lib/reducer.js').default;
		const actions = [
			{type: "loadConfig", username: req.params.username},
			{type: "loadDecks"}
		];
		const state = actions.reduce(reducer, Map());
		//console.log(JSON.stringify(state.toJS(), null, '\t'))
		res.json(state.getIn(["decks"], Map()).toJS());
	});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

export default app;
