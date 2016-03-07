import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';

export const ReviewQuestion = React.createClass({
	mixins: [PureRenderMixin],
	render: function() {
		//console.log("table: "+JSON.stringify(table))
		const questionDOM = <div>
			<h1>Question</h1>
			<div>{this.props.questionText}</div>
		</div>
		if (!this.props.doShowAnswer) {
			return <div>
				{questionDOM}
				<div>
					<button onClick={() => this.props.reviewShowAnswer()}>
						Show Answer
					</button>
				</div>
			</div>;
		}
		else {
			return <div>
				{questionDOM}
				<h1>Answer</h1>
				Not yet implemented, says karina
			</div>;
		}
	},
});

const mapStateToProps = (state) => ({
	questionText: state.getIn(["ui", "review", "questionText"]),
	doShowAnswer: state.getIn(["ui", "review", "doShowAnswer"], false),
});

const actions = {
	reviewShowAnswer: () => {
		return {type: "reviewShowAnswer"};
	}
};

export const ReviewContainer = connect(mapStateToProps, actions)(ReviewQuestion);
