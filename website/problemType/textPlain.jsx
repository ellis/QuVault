var problemType_textPlain = {
	getFlashcardQuestionIndexes: function(problem) {
		return [0];
	},
	getQuestionRenderer: function(problem, index, onShowAnswer) {
		return React.createClass({
			getInitialState: function() {
				return { answer: "" };
			},
			render: function() {
				var data = problem;
				return (
					<div>
						<div>
							Question: {data.question}
						</div>
						<div>
							Your answer:
							<input type="text" value={this.state.answer} onChange={this.handleAnswerChange}/>
							<button onClick={this.handleSubmit}>Submit</button>
						</div>
					</div>
				);
			},
			handleAnswerChange: function(e) {
				var answer = e.target.value;
				console.log("answer: "+answer);
				this.setState({answer: answer});
			},
			handleSubmit: function(e) {
				onShowAnswer(this.state.answer);
				//this.setState({mode: "answer"});
			}
		});
	},
	getAnswerRenderer: function(prolem, index, answer) {
		return null;
	},
	getAutogradedFlashcardScore: function(problem, index, answer) {
		return null;
	},
	getSummaryRenderer: function(problem) {
		return null;
	}
};

