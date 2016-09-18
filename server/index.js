'use strict';

const SERVER_PORT = process.env.PORT || 3000;
const PING_MS = 500;
const CONFIG = require('./config.json');
const VIEW_CONTEXTS = require('./contexts');

const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');
const ModelTrack = require('./Track');
const mustacheExpress = require('mustache-express');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const spotifyApi = new SpotifyWebApi({});

const musicQueue = [];
const reAcceptableCharacters = /[^\w\s]/g;

server.listen(SERVER_PORT, () => {
    console.log(`Server listening on port ${SERVER_PORT}`);
});

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', `${__dirname}/../client/views`);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": true }));
app.use(express.static(`${__dirname}/../client/public`));

app.get('/', function(req, res){
	res.render('index', getDefaultContext());
});

app.post('/search', function(req, res){

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
		const context = getDefaultContext();
		context['results'] = VIEW_CONTEXTS.renderResults(tracks);
		res.render('index', context);
	}, function(err){
		console.log("err", err);
	}).catch(function(err){
		console.error(err);
	});

});

app.post('/queue/add', function(req, res){

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
		musicQueue.push(model);
		res.redirect('/');
	}, function(err){
		console.log('err', err);
		const context = getDefaultContext();
		context['error'] = VIEW_CONTEXTS.renderError(
			'Could not find track in spotify.');
		return res.render('index', context);
	}).catch(function(err){
		const context = getDefaultContext();
		context['error'] = VIEW_CONTEXTS.renderError('I coded something badly');
		return res.render('index', context);
	});
});

function getDefaultContext(){
	const context = VIEW_CONTEXTS.renderIndex();
	context['queue'] = VIEW_CONTEXTS.renderQueue(musicQueue);
	return context;
}
