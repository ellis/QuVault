import _ from 'lodash';
import Immutable, {List, Map, fromJS} from 'immutable';

export const initialState = Map();

export default class StateWrapper {
	/**
	 * Create a StateWrapper
	 * @param  {object|immutable:Map} state - state to wrap
	 */
	constructor(state = initialState) {
		this.state = fromJS(state);
	}

	getState() { return this.state; }

	check() {
		// TODO: check validity of state
	}

	/**
	 * Create a new deck of problems.
	 * @param  {string} uuid - UUID for the new deck
	 * @param  {string} name - name for the new deck
	 * @param  {string} parent - UUID of the deck's parent
	 * @param  {string} after - UUID of a sibling problem that this problem should be ordered after when decks are listed
	 * @return {StateWrapper} pointer to self
	 */
	createDeck(uuid, name, parent, after) {
		const deck = _.merge({}, {
			uuid,
			name,
			parent,
			after
		});
		this.state = this.state.setIn(["decks", uuid], fromJS(deck));
		return this;
	}

	/**
	 * Add a list of problem UUIDs to a deck.
	 * @param {array} problemUuids - an array of UUID strings of problems to add to the given deck
	 * @param {string} deckUuid - UUID of the deck
	 * @return {StateWrapper} pointer to self
	 */
	addProblemsToDeck(problemUuids, deckUuid) {
		_.forEach(problemUuids, problemUuid => {
			this.state = this.state.setIn(["problems", problemUuid, "decks", deckUuid], true);
		});
		return this;
	}
};
