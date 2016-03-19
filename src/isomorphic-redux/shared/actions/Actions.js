import request from 'axios';

export function getDecks() {
	console.log("Actions.getDecks()")
	return {
		type:    'GET_DECKS',
		promise: request.get(`http://localhost:3001/api/u/default/decks`)
	}
}

export function getQuestion(params) {
	console.log("Actions.getQuestion(): "+JSON.stringify(params))
	return {
		type:    'GET_QUESTION',
		promise: request.get(`http://localhost:3001/api/u/default/problem/${params.problemUuid}/${params.index}`)
	}
}
