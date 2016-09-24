'use strict';

const CONFIG = require('./config.json');
const VIEW_CONTEXTS = require('./contexts');
const STATE = require('./State');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const express = require('express');
const mustacheExpress = require('mustache-express');
const SpotifyWebApi = require('spotify-web-api-node');

const ModelTrack = require('./Track');
const reAcceptableCharacters = /[^\w\s]/g;
const spotifyApi = new SpotifyWebApi({});

module.exports = function createApp(){
	const app = express();

	app.engine('mustache', mustacheExpress());

	app.set('view engine', 'mustache');
	app.set('views', `${__dirname}/../client/views`);

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ "extended": true }));
	app.use(cookieParser());
	app.use(csrf({ "cookie": true }));
	app.use(express.static(`${__dirname}/../client/public`));
	app.use(handleCSRFTokenError);

	app.get('/', routeGetIndex);
	app.post('/search', routePostSearch);
	app.post('/queue/add', routePostQueueAdd);

	return app;
};

function getDefaultContext(csrfToken){
	const context = VIEW_CONTEXTS.renderIndex(csrfToken);
	context['queue'] = VIEW_CONTEXTS.renderQueue(STATE.get('queue'));
	if(STATE.get('current') !== false) {
		context['current'] = VIEW_CONTEXTS.renderCurrent(STATE.get('current'));
	}
	return context;
}

function handleCSRFTokenError(err, req, res, next){
	if (err.code !== 'EBADCSRFTOKEN') return next(err);
	res.status(403);
	res.send('403: gtfo');
}

function routeGetIndex(req, res){
	res.render('index', getDefaultContext(req.csrfToken()));
}

function routePostQueueAdd(req, res){
	// Strip out any characters that are nono
	const spotifyId = req.body['trackId'].replace(reAcceptableCharacters, '');

	if(spotifyId === ''){
		const context = getDefaultContext();
		context['error'] = VIEW_CONTEXTS.renderError(
			'Spotify track id was not a valid id.');
		return res.render('index', context);
	}

	// Check is valid spotify id
	spotifyApi.getTrack(spotifyId, {
		"country": CONFIG.SPOTIFY_LOCALE
	}).then(function(data){
		const model = ModelTrack.fromSpotify(data.body);
		STATE.get('queue').push(model);
		res.redirect('/');
	}, function(err){
		console.log('err', err);
		const context = getDefaultContext(req.csrfToken());
		context['error'] = VIEW_CONTEXTS.renderError(
			'Could not find track in spotify.');
		return res.render('index', context);
	}).catch(function(err){
		const context = getDefaultContext();
		context['error'] = VIEW_CONTEXTS.renderError('I coded something badly');
		return res.render('index', context);
	});
}

function routePostSearch(req, res){
	// Strip anything out that is not letters or numbers
	const trackName = req.body['track-name'].replace(
		reAcceptableCharacters, '');

	// If there is no track name, redirect back
	if(trackName === ''){
		return res.redirect('/');
	}

	// Search spotify
	spotifyApi.searchTracks(trackName, {
		"country": CONFIG.SPOTIFY_LOCALE,
		"limit": 50
	})
	.then(function(data){
		const tracks = data.body.tracks.items.map(
			ModelTrack.fromSpotify);
		const context = getDefaultContext(req.csrfToken());
		context['results'] = VIEW_CONTEXTS.renderResults(tracks);
		res.render('index', context);
	}, function(err){
		console.log("err", err);
	}).catch(function(err){
		console.error(err);
	});
}
