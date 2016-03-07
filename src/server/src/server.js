var app = require('express')();
var http = require('http').Server(app);
import fs from 'fs';
import {List} from 'immutable';
import jsonfile from 'jsonfile';
import mkdirp from 'mkdirp';
import moment from 'moment';
import path from 'path';
import Server from 'socket.io';

export function startServer(store) {
	app.get('/', function(req, res){
	  res.sendFile(__dirname + '/index.html');
	});

	http.listen(12346, function(){
	  console.log('listening on *:12346');
	});

	const io = new Server(http);

	store.subscribe(
		() => {
			console.log(store.getState());
			io.emit('state', store.getState().toJS());
		}
	);

	io.on('connection', (socket) => {
		console.log({id: socket.id});
		socket.emit('state', store.getState().toJS());
		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
		socket.on('action', store.dispatch.bind(store));
		socket.on('question', function(action) {
			const result = handle_question(store.getState(), action.problemUuid, action.index);
			socket.emit("question", result);
		});
	});
}

function handle_question(state, problemUuid, index) {
	console.log(`handle_question(${problemUuid}, ${index})`);
	// Try to find a directory with the problem file
	const dir = state.getIn(["config", "problemDirs"], List()).find(dir => fs.existsSync(path.join(dir, problemUuid+".json")));
	const filenameJson = path.join(dir, problemUuid+".json");

	console.log(filenameJson);
	if (fs.existsSync(filenameJson)) {
		const problem = jsonfile.readFileSync(filenameJson);
		console.log(JSON.stringify(problem, null, "  "));

		const problemType = require('../../problemTypes/default.js');
		console.log({problemType})

		const format = "markdown";
		const renderer = problemType.getQuestionFlashcardRenderer(format, problem, index, undefined, false);
		return {format, data: renderer.data};
	}
}
