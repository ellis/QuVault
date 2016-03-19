import _ from 'lodash';
import Immutable from 'immutable';
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as Actions from '../actions/Actions.js';

class Question extends React.Component {
	static propTypes = {
		question: PropTypes.any.isRequired,
		dispatch: PropTypes.func.isRequired
	};

	static needs = [Actions.getQuestion];

	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}

	render() {
		//console.log("table: "+JSON.stringify(table))
		return <div>
			<h1>Question</h1>
			<b>{this.props.question.getIn(["data", "data"])}</b>
			<button>Score</button>
		</div>;
	}
}

const mapStateToProps0 = (state) => ({
	question: state.data.getIn(["ui", "question"])
});
const mapStateToProps = (state) => {
	console.log(`Question.mapStateToProps:`)
	console.log(state);
	return {
		question: (state.quvault || Immutable.Map()).getIn(["ui", "question"])
	};
};

const actions = {
	//decksReview: (deckUuid) => ({type: "decksReview", deckUuid}),
	//review: () => ({type: "decksReview", deckUuid})
};

// export const DecksContainer = connect(mapStateToProps, actions)(Decks);
export default connect(mapStateToProps)(Question);
