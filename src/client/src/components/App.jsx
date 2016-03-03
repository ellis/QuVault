import {List, Map} from 'immutable';
import React from 'react';
import {Link} from 'react-router';

const pair = List.of('Trainspotting', '28 Days Later');
const tally = Map({'Trainspotting': 5, '28 Days Later': 4});

export default React.createClass({
	render: function() {
		console.log("App.render")
		console.log(this.props);
		// return <div>Hello from App!</div>
		// return <div>
		// 	<a href="/webpack-dev-server/?#/decks">Decks</a> <a href="/webpack-dev-server/?#/review">Review</a>
		// 	<br/>
		// 	{this.props.children}
		// </div>;
		// return React.cloneElement(this.props.children, {pair: pair});
		return <div>
			<Link to='/decks'>Decks</Link> <Link to='/review'>Review</Link>
			{(this.props.children) ? React.cloneElement(this.props.children, {pair: pair, tally: tally}) : undefined}
		</div>;
	}
});
