import _ from 'lodash';
import should from 'should';
import Immutable, {List, Map, fromJS} from 'immutable';
import StateWrapper from '../lib/StateWrapper.js';

const stateD1 = {
	decks: {
		AAAAA: {uuid: "AAAAA", name: "Deck 1"}
	}
};
const stateD2 = {
	decks: {
		AAAAA: {uuid: "AAAAA", name: "Deck 1"},
		BBBBB: {uuid: "BBBBB", name: "Deck 2", parent: "AAAAA"},
	}
};
const stateD3 = {
	decks: {
		AAAAA: {uuid: "AAAAA", name: "Deck 1"},
		BBBBB: {uuid: "BBBBB", name: "Deck 2", parent: "AAAAA"},
		CCCCC: {uuid: "CCCCC", name: "Deck 3", parent: "AAAAA", after: "BBBBB"},
	}
};
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

describe('StateWrapper', function() {
	describe('createDeck', function() {
		it('should create a first deck', function() {
			const wrapper = new StateWrapper();
			wrapper.createDeck("AAAAA", "Deck 1");
			should.deepEqual(wrapper.state.toJS(), stateD1);
		});
		it('should create a second deck', function() {
			const wrapper = new StateWrapper(stateD1);
			wrapper.createDeck("BBBBB", "Deck 2", "AAAAA");
			should.deepEqual(wrapper.state.toJS(), stateD2);
		});
	});
	describe("addProblemsToDeck", function() {
		it("should add a problem", function() {
			const wrapper = new StateWrapper(stateD3);
			wrapper.addProblemsToDeck(["P0001"], "CCCCC");
			should.deepEqual(wrapper.state.toJS(), stateD3P1);
		});
	});
});
