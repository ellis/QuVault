import _ from 'lodash';
import mustache from 'mustache';

const template =
`{{#problem.instructions}}
{{problem.instructions}}

{{/problem.instructions}}
{{#problem.title}}
**{{problem.title}}**

{{/problem.title}}
{{#problem.description}}
**{{problem.description}}**

{{/problem.description}}
{{problem.question}}
`;

const problemType = {
	getFlashcardQuestionIndexes: function(problem) {
		return [0];
	},
	getQuestionFlashcardRenderer: function(format, problem, index) {
		return {
			format: "markdown",
			data: mustache.render(template, {problem})
		};/*
		//console.log(problem.question)
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
			? `**Question:**\n\n${problem.question}`
			: undefined;
		//console.log(question)
		const list = _.compact([instructions, title, description, question]);
		//console.log(list)
		return {
			format: "markdown",
			data: list.join("\n\n")
		};*/
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
