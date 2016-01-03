import _ from 'lodash';
import Diff from 'text-diff';
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
{{#response}}

Your response:
{{response}}
{{/response}}
{{#answer}}

Answer:
{{answer}}
{{/answer}}
`;

const problemType = {
	getFlashcardQuestionIndexes: function(problem) {
		return [0];
	},
	getQuestionFlashcardRenderer: function(format, problem, index, response, showAnswer) {
		const answer
			= (showAnswer && problem.answerExact) ? problem.answerExact
			: (showAnswer && problem.answer) ? problem.answer
			: undefined;
		return {
			format: "markdown",
			data: mustache.render(template, {problem, response, answer}).trim()
		};
	},
	getResponseScorer: function(format, problem, index, response) {
		const diff = new Diff();
		const diff1 = diff.main(problem.answer, response);
		return {
			format: "html",
			data: diff.prettyHtml(diff1)
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
