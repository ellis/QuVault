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
				var elemInstructions = (data.instructions)
				 	? <div className="row margin-topbot-05"><div className="col-md-12"><em>{data.instructions}</em></div></div>
					: null;
				var elemTitle = (data.title)
				 	? <div className="row margin-topbot-05"><div className="col-md-12"><strong>{data.title}</strong></div></div>
					: null;
				var elemDescription = (!data.description) ? null :
					<div className="row margin-topbot-05"><div className="col-md-12">
						{data.description}
					</div></div>;
				var elemQuestion = (!data.question) ? null :
					<div className="row margin-topbot-05">
						<div className="col-md-12">
							<strong>Question:</strong><br/>
							{data.question}
						</div>
					</div>;
				return (
					<div>
						{elemInstructions}
						{elemTitle}
						{elemDescription}
						{elemQuestion}
						<div className="row margin-topbot-05">
							<div className="col-md-12">
								<strong>Your answer:</strong><br/>
								<input type="text" value={this.state.answer} onChange={this.handleAnswerChange}/>
							</div>
						</div>
						<div className="row">
							<div className="col-sm-2 col-sm-offset-2">
								<button onClick={this.handleSubmit}>Show solution</button>
							</div>
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
