const express = require('express');
const bodyParser = require('body-parser');
var http = require('http').Server(app);

const app = express();
const router = express.Router();

const port = process.env.PORT || 8080;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// all of our routes will be prefixed with /api
app.use('/api', router);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.listen(port);
console.log("Listening on port "+port);
