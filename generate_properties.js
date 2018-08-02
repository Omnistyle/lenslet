const Zillow = require("node-zillow");
const availableEndpoints = require('./lib/api-list');
const fs = require('fs');

const BATCH_SIZE = 100;
const NUM_BATCH = 10;
const OUTPUT_FILE = "./url-list.json"
const MAX_ZPID = 1000000 * BATCH_SIZE

const zillow = new Zillow("X1-ZWz1gklptnjw97_5xiff", {
	https: true
});

// Passes the results of making 'n_batch' batches of requests into next.
// Requests are made asynchronously, BATCH_SIZE at a time.
async function processBatch(n_batch) {
	if (n_batch <= 0) {
		return [];
	}
	requests = []
	for (var i = 0; i < BATCH_SIZE; i++) {
		requests.push(
			zillow.get('GetZestimate', {
				zpid: Math.floor(Math.random() * Math.floor(MAX_ZPID))
			}).catch(err => {
					console.log(err);
				})
		);
	}
	// Wait for all promises to return.
	const curr = await Promise.all(requests)
	const filtered = curr.filter(it => {
		// Only keep those that have the data from which we want to construct
		// the URL.
		return (
			'response' in it &&
			'zpid' in it.response &&
			'address' in it.response &&
			'street' in it.response.address &&
			'city' in it.response.address &&
			'state' in it.response.address
		);
	}).map(it => {
		return {
			zpid: it.response.zpid,
			address: it.response.address.street,
			citystatezip: it.response.address.city + ", " + it.response.address.state,
		};
	});

	// Check the DeepSearchResults for images.
	requests = filtered.map(it => {
		return zillow.get('GetUpdatedPropertyDetails', {
			zpid: it.zpid
		}).catch(err => {
			console.log(err);
		});
	});
	const results = await Promise.all(requests);
	var final = []
	for (var i = 0; i < results.length; i++) {
		if ('response' in results[i] && 'images' in results[i].response) {
			final.push(filtered[i]);
		}
	}

	const rest = await processBatch(n_batch - 1);
	return final.concat(rest);
};

async function main(){
	const res = await processBatch(NUM_BATCH);
	fs.writeFile(OUTPUT_FILE, JSON.stringify({'data' : res}, null, 2), err => {
		if (err) throw err;
		console.log('Saved ' + res.length + ' data points!');
	});
};

main();