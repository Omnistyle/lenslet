# Lenlet Zillow API

A barebones Node.js app using [Express 4](http://expressjs.com/).

This application implements a simple forwarding mechanism for the [Zillow API](https://www.zillow.com/howto/api/APIOverview.htm). It does three main tasks:

1. All incoming requests are accepted by the server, regardless of origin.
2. All valid Zillow API requests are forward to the Zillow API.
3. All responses are converted from XML to valid JSON responses.

## Using the API

The API is an exact replica of the Zillow API (as it just forwards requests). Currently supported endpoints for forwarding are:

```javascript
var supportedEndpoints = [
	GetDeepSearchResults, 
  GetUpdatedPropertyDetails, 
  GetDeepComps, 
  GetRateSummary, 
  GetMonthlyPayments, 
  GetDemographics, 
  GetRegionChildren, 
  GetRegionChart, 
  GetSearchResults, 
  GetZestimate, 
  GetChart, 
  GetComps,
 ]
```
The endpoints correspond to those described in the [Zillow API](https://www.zillow.com/howto/api/APIOverview.htm).

Endpoints should be reached by making a request to:
```
https://lenslet.herokuapp.com/api/<ENDPOINT>?param1=<VALUE1>&param2=<VALUE2>
```

## Example

For example, from a front-end client the following will do a search on the Zillow API:

```javascript
const req = new XMLHttpRequest();
const url="https://lenslet.herokuapp.com/api/GetSearchResults?address=2114+Bigelow+Ave&citystatezip=Seattle%2C+WA";
req.open("GET", url);
req.onreadystatechange=(e)=>{
	// For some reason, throws an unexpected end of data error.
	const result = JSON.parse(this.responseText)
	// We have the JSON result available for use here.
	console.log(result)
}
req.send();
```

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone https://github.com/Omnistyle/lenslet.git # or clone your own fork
$ cd lenslet
$ npm install
$ heroku local web
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Creating on Heroko
If you want to deploy your own version to heroku, run the following. Note that you'll need to be logged-in

```
$ heroku create
$ git push heroku master
$ heroku open
```

If you'd rather just deploy to the current lenslet.herokuapp.com version:
```
$ heroku git:remote -a lenslet
```

The above command will just add a heroku remote pointing to the existing lenslet.herokuapp.com site.

## Deploying on Heroko
Once the heroku app is created (or associated with the existing lenslet.herokuapp.com site), deployment is as simple as pushing:
```
$ git push heroku master
```
