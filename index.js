const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const Zillow = require("node-zillow");
const availableEndpoints = require('./lib/api-list');
const linkData = require('./url-list.json').data;

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
app.get('/api/:endpoint', async (req, res) => {
	const endpoint = req.params.endpoint;
	if (!(endpoint in availableEndpoints)) {
		return res.json({
			'error': 'Invalid endpoint requested: ' + endpoint,
			'availableEndpoints': availableEndpoints,
		});
	}
	// Otherwise, forward the requqest and parameters to zillow library.
	const results = await zillow.get(req.params.endpoint, req.query);
	return res.json(results);
});

// Setup a lenslet/schema endpoints that returns the schema.
app.get('/lenslet/schema', (req, res) => {
	const fullUrl = req.protocol + '://' + req.get('host');
	return res.json(linkData.map(it => {
		const params = {
			'addreszps': it.address,
			'citystatezip': it.citystatezip,
			'zpid': it.zpid,
		};
		const encodedParams = Object.keys(params).map(k => {
    	return encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
		}).join('&');
		return fullUrl + '/lenslet?' + encodedParams;
	}));
});

// Setup routes to actually render the lenslet.
app.get('/lenslet', async (req, res) => {
	const results = await zillow.get('GetUpdatedPropertyDetails', {
		zpid: req.query.zpid,
	});
	if (!('response' in results)) {
		console.log("Rendering error page!");
		return res.render('pages/index');
	}
	const result = results.response;
	const address = result.address;
	var imageUrls = [];
	for (i in result.images.image) {
		const image = result.images.image[i];
		for (j in image.url) {
			imageUrls.push(image.url[j])
		}
	}
	console.log(imageUrls);
	const description = result.homeDescription;

	// Also grab the Zestimate.
	const estimate = await zillow.get('GetZestimate', {
		zpid: req.query.zpid,
	});
	var price = "Unknown";
	if ('response' in estimate && 'zestimate' in estimate.response &&
			'amount' in estimate.response.zestimate) {
		price = estimate.response.zestimate.amount[0]['_'];
	}
	const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	// return res.json(price);
	return res.render('pages/property', {
		imageUrls: imageUrls,
		address: address,
		description: description,
		price: price,
		siteUrl: fullUrl,
	});
})

// Listen on the given port.
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
