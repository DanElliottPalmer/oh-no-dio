'use strict';

function State(){
	this._ = new Map();
}
State.prototype.get = function(key){
	return this._.get(key);
};
State.prototype.has = function(key){
	return this._.has(key);
};
State.prototype.set = function(key, value){
	return this._.set(key, value);
};

const state = new State();
state.set('queue', []);
state.set('current', false);

module.exports = state;
