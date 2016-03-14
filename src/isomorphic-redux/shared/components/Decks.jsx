import _ from 'lodash';
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as Actions from '../actions/Actions.js';

const Table = ({
	decks
}) => {
	return <table>
		<thead>
			<tr><th style={{textAlign: "left"}}>Decks</th><th>Due</th><th>New</th><th>Wait</th></tr>
		</thead>
		<tbody>
			{(decks) ?
				_.map(decks.toJS(), (deck, deckUuid) => <tr key={"deck_"+deckUuid}>
					<td>{deck.name}</td>
					<td style={{textAlign: "right"}}>{deck.pending}</td>
					<td style={{textAlign: "right"}}>{deck.new}</td>
					<td style={{textAlign: "right"}}>{deck.waiting}</td>
				</tr>)
			: undefined}
		</tbody>
	</table>;
};

class Decks extends React.Component {
	static propTypes = {
		decks: PropTypes.any.isRequired,
		dispatch: PropTypes.func.isRequired
	};

	static needs = [Actions.getDecks];

	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		console.log("table: "+JSON.stringify(table))
		return <div>
			<h1>Decks</h1>
			<Table decks={this.props.decks}/>
			<button>Review All</button>
		</div>;
	}
}

const mapStateToProps = (state) => ({
	// decks: state.getIn(["data", "decks"])
	decks: state.data.getIn(["decks"])
});

const actions = {
	//decksReview: (deckUuid) => ({type: "decksReview", deckUuid}),
	//review: () => ({type: "decksReview", deckUuid})
};

export const DecksContainer = connect(mapStateToProps, actions)(Decks);
