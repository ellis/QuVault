import _ from 'lodash';
import Immutable, {List, Map, fromJS} from 'immutable';

export const initialState = fromJS({});

export default class StateWrapper {
	constructor(state = initialState) {
		this.state = fromJS(state);
	}

	createDeck(uuid, name, parent, after) {
		const deck = _.merge({}, {
			uuid,
			name,
			parent,
			after
		});
		this.state = this.state.setIn(["decks", uuid], deck);
	}

	addProblemsToDeck(problemUuids, deckUuid) {
		_.forEach(problemUuids, problemUuid => {
			this.state = this.state.setIn(["problems", problemUuid, "decks", deckUuid], true);
		});
	}
};
