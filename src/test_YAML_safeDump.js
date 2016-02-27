var YAML = require('js-yaml');

var x = {
	//a: "A buyer's market is a market in which the buyers have more power to determine the conditions of exchange.\nThe converse is true.\n"
	a: "1\n2\\beta\n"
};
console.log(YAML.safeDump(x));
