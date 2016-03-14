import request from 'axios';

export function getDecks() {
	console.log("Actions.getDecks()")
	return {
		type:    'GET_DECKS',
		promise: request.get(`http://localhost:3001/api/u/default/decks`)
	}
}
