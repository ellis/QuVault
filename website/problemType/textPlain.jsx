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
				var elemTitle = (!data.title) ? null :
					<div className="row">
						<div className="col-md-2 text-right">
							<strong>Title:</strong>
						</div>
						<div className="col-md-10">
							{data.title}
						</div>
					</div>;
				var elemDescription = (!data.description) ? null :
					<div className="row">
						<div className="col-md-2 text-right">
							<strong>Description:</strong>
						</div>
						<div className="col-md-10">
							{data.description}
						</div>
					</div>;
				var elemQuestion = (!data.question) ? null :
					<div className="row">
						<div className="col-md-2 text-right">
							<strong>Question:</strong>
						</div>
						<div className="col-md-10">
							{data.question}
						</div>
					</div>;
				return (
					<div>
						{elemTitle}
						{elemDescription}
						{elemQuestion}
						<div className="row">
							<div className="col-md-2 text-right">
								<strong>Your answer:</strong>
							</div>
							<div className="col-md-10">
								<input type="text" value={this.state.answer} onChange={this.handleAnswerChange}/>
							</div>
						</div>
						<div className="row">
							<div className="col-md-2 col-md-offset-2">
								<button onClick={this.handleSubmit}>Submit</button>
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

