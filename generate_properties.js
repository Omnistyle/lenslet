const Zillow = require("node-zillow");
const availableEndpoints = require('./lib/api-list');
const fs = require('fs');

const BATCH_SIZE = 1000;
const NUM_RESULTS = 10000;
const OUTPUT_FILE = "./url-list.json"
const MAX_ZPID = 1000000 * BATCH_SIZE

const zillow = new Zillow("X1-ZWz1gklptnjw97_5xiff", {
	https: true
});

// Returns a promise containing 'num_results' which satisfy all of our required
// properties. 'invalid' is an object containing keys corresponding to invalid
// zpids.
async function processBatch(num_results, invalid = {}) {
	if (num_results <= 0) {
		return [];
	}
	console.log('Requests left to fulfill: ' + num_results);
	var requests = [];
	for(var i = 0; i < Math.min(BATCH_SIZE, num_results); i++) {
		var candidateZpid = Math.floor(Math.random() * Math.floor(MAX_ZPID));
		while(candidateZpid in invalid) {
			candidateZpid = Math.floor(Math.random() * Math.floor(MAX_ZPID));
		}
		// Add it to invalid so we can keep track.
		invalid[candidateZpid] = true
		requests.push(zillow.get('GetZestimate', {
				zpid: candidateZpid
			}).catch(err => {
					console.log(err);
		}));
	}
	
	// Wait for requested results to return asynchronously.
	const curr = await Promise.all(requests).catch(err => console.log(err));
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
	const rest = await processBatch(num_results - final.length, invalid);
	return final.concat(rest);
};

async function main(){
	const res = await processBatch(NUM_RESULTS);
	fs.writeFile(OUTPUT_FILE, JSON.stringify({'data' : res}, null, 2), err => {
		if (err) throw err;
		console.log('Saved ' + res.length + ' data points!');
	});
};

main();