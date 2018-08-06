const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const Zillow = require("node-zillow");
const availableEndpoints = require('./lib/api-list');
const linkData = require('./url-list.json').data;

const app = express();

function deepFind(obj, path, base=undefined) {
  var paths = path.split('.')
    , current = obj
    , i;

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return base;
    } else {
      current = current[paths[i]];
    }
  }
  return current;
}

const zillow = new Zillow("X1-ZWz18fsp4hqz2j_8uv2u", {
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
	return res.json({
		urls: linkData.map(it => {
		const params = {
			'addreszps': it.address,
			'citystatezip': it.citystatezip,
			'zpid': it.zpid,
		};
		const encodedParams = Object.keys(params).map(k => {
    	return encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
		}).join('&');
		return fullUrl + '/lenslet?' + encodedParams;
	})});
});

// Setup routes to actually render the lenslet.
app.get('/lenslet', async (req, res) => {
	const results = await zillow.get('GetUpdatedPropertyDetails', {
		zpid: req.query.zpid,
	});
	if (!('response' in results)) {
		return res.json({
			error: "Unable to retrieve results!",
			results: results,
		});
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
	const description = result.homeDescription;

	// Also grab the Zestimate.
	const estimate = await zillow.get('GetDeepSearchResults', {
		zpid: req.query.zpid,
		address: address.street,
		citystatezip: address.zipcode,
		rentzestimate: true,

	});
	const lastSold = parseInt(deepFind(estimate, 'response.results.result.0.lastSoldPrice.0._', 0));
	const price = parseInt(deepFind(estimate, 'response.results.result.0.zestimate.0.amount.0._', 0));
	const currency = deepFind(estimate, 'response.results.result.0.lastSoldPrice.0.$.currency', 'USD');
	const sqFootage  = parseInt(deepFind(estimate, 'response.results.result.0.finishedSqFt', 0));
	const yearBuilt = parseInt(deepFind(estimate, 'response.results.result.0.yearBuilt', 0));
	const medianListPrice = parseInt(deepFind(estimate, 'response.results.result.0.localRealEstate.0.region.0.zindexValue', 0))
	const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	// return res.json(price);
	return res.render('pages/property', {
		imageUrls: imageUrls,
		address: address,
		description: description,
		price: price.toLocaleString('en-US', {style: 'currency', currency: currency}),
		lastSold: lastSold.toLocaleString('en-US', {style: 'currency', currency: currency}),
		siteUrl: fullUrl,
		sqFootage: sqFootage,
		yearBuilt: yearBuilt,
		medianListPrice: medianListPrice.toLocaleString('en-US', {style: 'currency', currency: currency}),
	});
})

// Listen on the given port.
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
