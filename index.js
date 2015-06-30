var Rx = require('rx-dom');

// makeHTTPDriver is a factory, but it has no parameters.
// It would be simpler to just export httpDriver() function,
// but maybe it would make sense to give some parameters
// to the factory. I just don't know which parameters would
// those be. A cache? Suggestions please.
function makeHTTPDriver(cache) {
  return function httpDriver(request$) {
    return {
    	get: function(params$){
    		//cache could be implemented here, full request url as key
    		//if(cache) {...}
    		//else
    		return params$.flatMapLatest(function(parameters){
    			return Rx.DOM.ajax((typeof parameters === "string") ? encodeURI(parameters) : parameters)
    		})
    	}
    }
  }
}

module.exports = makeHTTPDriver;