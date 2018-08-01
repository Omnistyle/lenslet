const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const Zillow = require("node-zillow");
const availableEndpoints = require('./lib/api-list');

const app = express();

const zillow = new Zillow("X1-ZWz1gklptnjw97_5xiff", {
	https: true
});


// Enable CORS requests on all domains.
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });


// Serve static content in public/ directory.
app.use(express.static(path.join(__dirname, 'public')));


// Set-up templates.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
  
// Root page will render the pages/index, which will be our main lenslet.
app.get('/', (req, res) => res.render('pages/index'));

// Setup an api route in express.
// /api/GetResults will set req.params = 'GetResults'
app.get('/api/:endpoint', (req, res) => {
	const endpoint = req.params.endpoint;
	if (!(endpoint in availableEndpoints)) {
		return res.json({
			'error': 'Invalid endpoint requested: ' + endpoint,
			'availableEndpoints': availableEndpoints,
		});
	}
	// Otherwise, forward the requqest and parameters to zillow library.
	zillow.get(req.params.endpoint, req.query)
		.then(function(results) {
			res.json(results)
  	});
});

// Set-up some of the API.

// We want to set-up an API route that will forward our requests to Zillow in
// order to avoid API

// Listen on the given port.
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
