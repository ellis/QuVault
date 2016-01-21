import _ from 'lodash';
import should from 'should';
import Immutable, {List, Map, fromJS} from 'immutable';
import reducer from '../lib/reducer.js';

const stateD3P1 = {
	decks: {
		AAAAA: {uuid: "AAAAA", name: "Deck 1"},
		BBBBB: {uuid: "BBBBB", name: "Deck 2", parent: "AAAAA"},
		CCCCC: {uuid: "CCCCC", name: "Deck 3", parent: "AAAAA", after: "BBBBB"},
	},
	problems: {
		P0001: {
			decks: {
				CCCCC: true
			}
		}
	}
};

describe('reducer', function() {
	describe('reducer', function() {
		it('should handle createDeck and addProblemsToDeck', function() {
			const actD1 = {"type": "createDeck", "uuid": "AAAAA", "name": "Deck 1"};
			const actD2 = {"type": "createDeck", "uuid": "BBBBB", "name": "Deck 2", "parent": "AAAAA"};
			const actD3 = {"type": "createDeck", "uuid": "CCCCC", "name": "Deck 3", "parent": "AAAAA", "after": "BBBBB"};
			const actP1 = {"type": "addProblemsToDeck", "problems": ["P0001"], "deck": "CCCCC"};
			const state = _.reduce([actD1, actD2, actD3, actP1], (acc, act) => reducer(acc, act), undefined);
			//console.log(state)
			should.deepEqual(state.toJS(), stateD3P1);
		});
	});
});
