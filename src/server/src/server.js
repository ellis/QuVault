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
	});
}
