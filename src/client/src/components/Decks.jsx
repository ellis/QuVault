import _ from 'lodash';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';

const Table = ({
	decks
}) => {
	return <table>
		<thead>
			<tr><th align="left">Decks</th><th>New</th><th>Pending</th><th>Waiting</th></tr>
		</thead>
		<tbody>
			{_.map(decks.toJS(), (deck, deckUuid) => <tr key={"deck_"+deckUuid}>
				<td>{deck.name}</td>
				<td style={{textAlign: "right"}}>{deck.new}</td>
				<td align="right">{deck.pending}</td>
				<td align="right">{deck.waiting}</td>
			</tr>)}
		</tbody>
	</table>;
};

export const Decks = React.createClass({
	mixins: [PureRenderMixin],
	render: function() {
		//console.log("table: "+JSON.stringify(table))
		return <div>
			<h1>Decks</h1>
			<Table decks={this.props.decks}/>
			<button>Review All</button>
		</div>;
	}
});

const mapStateToProps = (state) => ({
	decks: state.getIn(["data", "decks"])
});

const actions = {
	//decksReview: (deckUuid) => ({type: "decksReview", deckUuid}),
	//review: () => ({type: "decksReview", deckUuid})
};

export const DecksContainer = connect(mapStateToProps, actions)(Decks);
