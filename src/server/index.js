import {createStore} from 'redux';
import {startServer} from './src/server';
import reducer from '../lib/reducer.js';

export const store = createStore(reducer);
store.dispatch({type: "loadConfig", username: "default"});
store.dispatch({type: "loadDecks"});
store.dispatch({type: "loadQuestions"});
store.dispatch({type: "calcReviewOrder"});

startServer(store);
