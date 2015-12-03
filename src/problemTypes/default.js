import _ from 'lodash';

const problemType = {
	getFlashcardQuestionIndexes: function(problem) {
		return [0];
	},
	getQuestionRenderer: function(problem, index) {
		const instructions = (problem.instructions)
			? `*${problem.instructions}*`
			: undefined;
		const title = (problem.title)
			? `**${problem.title}**`
			: undefined;
		const description = (problem.description)
			? problem.description
			: undefined;
		const question = (problem.question)
			? `**Question:**\n\n${problem.question}`;
		const list = _.compact(instructions, title, description, question);
		return {
			format: "markdown",
			data: list.join("\n\n")
		};
	},
	/*getAnswerRenderer: function(prolem, index, answer) {
		return null;
	},
	getAutogradedFlashcardScore: function(problem, index, answer) {
		return null;
	},
	getSummaryRenderer: function(problem) {
		return null;
	}*/
};

export default problemType;
