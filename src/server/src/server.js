var app = require('express')();
var http = require('http').Server(app);
import Server from 'socket.io';

export function startServer(store) {
	app.get('/', function(req, res){
	  res.sendFile(__dirname + '/index.html');
	});

	http.listen(8090, function(){
	  console.log('listening on *:12345');
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
		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
		// socket.on('chat message', function(msg){
		// 	console.log('message: ' + msg);
		// 	io.emit('chat message', msg);
		// });
		socket.emit('state', store.getState().toJS());
		socket.on('action', store.dispatch.bind(store));
		socket.on('question', function(action) {
			const result = handle_question(store.getState(), action.problemUuid, action.index);
			socket.emit("question", result);
		});
	});
}

function handle_question(state, problemUuid, index) {
	//console.log(`do_question(${problemUuid}, ${index})`);
	// Try to find a directory with the problem file
	const dir = state.getIn(["config", "problemDirs"], List()).find(dir => fs.existsSync(path.join(dir, problemUuid+".json")));
	const filenameJson = path.join(dir, problemUuid+".json");

	//console.log(filenameJson);
	if (fs.existsSync(filenameJson)) {
		const problem = jsonfile.readFileSync(filenameJson);
		//console.log(JSON.stringify(data, null, "  "));

		const problemType = require('../problemTypes/default.js');
		//console.log({problemType})

		const format = "markdown";
		const renderer = problemType.getQuestionFlashcardRenderer(format, problem, index, undefined, false);
		return {format, data: renderer.data};
	}
}
