'use strict';

require('babel-core/register')({});
require('babel-polyfill');

var server = require('./server').default;
var api = require('./api.js').default;

const PORT = process.env.PORT || 3000;
const PORT1 = parseInt(PORT) + 1;

server.listen(PORT, function () {
  console.log('Server listening on: ' + PORT);
});

api.listen(PORT1, function() {
	console.log("API listening on: "+PORT1);
})
