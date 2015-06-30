import Cycle, {Rx} from '@cycle/core';
import CycleWeb from'@cycle/web';
const h = CycleWeb.h;

function main(responses) {
  const GITHUB_SEARCH_API = 'https://api.github.com/search/repositories';

  // This essentially models when search requests are supposed
  // to happen
  const searchRequest$ = responses.DOM.get('.field', 'input')
    .debounce(500)
    .map(ev => ev.target.value)
    .filter(query => query.length > 0)
    .startWith('cyclejs');

  const apiRequest = responses.DOM.get('#github-api', 'request').map(e => e.detail)
  const apiResponse$ = responses.DOM.get('#github-api', 'response').map(e => e.detail.__data__.response).startWith(null)
  const apiError = responses.DOM.get('#github-api', 'error')

  apiRequest.subscribe(e => console.log("REQUEST",e))
  apiResponse$.subscribe(e => console.log("RESPONSE",e))
  apiError.subscribe(e => console.log(e))

  function logger (e) {
    console.log(e)
    return e;
  }

  searchRequest$.subscribe(logger)

  const vtree$ = apiResponse$
    .withLatestFrom(searchRequest$, (response, q) => ({q, response}))
    .map(logger)
    .map(({q, response}) =>
      h('div', [
        h('iron-ajax', {
          id:"github-api",
          auto: true,
          url: GITHUB_SEARCH_API,
          params: {'alt': 'json', q},
          'handle-as': 'json'
        }),
        h('label.label', 'Search:'),
        h('input.field', {attributes: {type: 'text'}, value: q}),
        h('hr'),
        response && response.items
        ? h('ul.search-results', response.items.map(result =>
          h('li.search-result', [
            h('a', {href: result.html_url}, result.name)
          ])
        ))
        : h('h3', 'no result')
      ])
    ).map(logger)

  return {
    DOM: vtree$
  };
}

Cycle.run(main, {
  DOM: CycleWeb.makeDOMDriver('.js-container')
});