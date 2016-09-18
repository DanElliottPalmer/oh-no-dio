'use strict';

function renderError(msg){
	return {
		"message": msg
	};
}

function renderIndex(){
	return {
		"error": false,
		"queue": false,
		"results": false
	}
}

function renderQueue(tracks){
	return {
		"items": tracks.map((track, index) => {
			return {
				"data": track.toJSON(),
				"index": index
			}
		})
	}
}

function renderResults(tracks){
	return {
		"items": tracks.map((track, index) => {
			return {
				"data": track.toJSON(),
				"index": index
			}
		})
	}
}

module.exports = {
	"renderError": renderError,
	"renderIndex": renderIndex,
	"renderQueue": renderQueue,
	"renderResults": renderResults
};
