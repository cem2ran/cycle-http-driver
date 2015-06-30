var Rx = require('rx-dom');

// makeHTTPDriver is a factory, but it has no parameters.
// It would be simpler to just export httpDriver() function,
// but maybe it would make sense to give some parameters
// to the factory. I just don't know which parameters would
// those be. A cache? Suggestions please.
function makeHTTPDriver() {
  return function httpDriver(request$) {
    return {
        get: function(key){
            return request$.map(function (request) {
              var response$ = Rx.DOM.ajax(request);
              response$.request = request.url || request;
              return response$;
            })
            .filter(function(res$){
                return res$.request.indexOf(key) === 0
            });
        }
    }
  }
}

module.exports = makeHTTPDriver;