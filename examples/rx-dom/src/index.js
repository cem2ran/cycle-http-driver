const Cycle = require('@cycle/core');
const CycleWeb = require('@cycle/web');
const makeHTTPDriver = require('../../../');
const h = CycleWeb.h;

function main({DOM, HTTP}) {
  const GITHUB_SEARCH_API = 'https://api.github.com/search/repositories?q=';
  const GIPHY_SEARCH_API = 'http://api.giphy.com/v1/gifs/search?q=';
  // This essentially models when search requests are supposed
  // to happen
  const githubRequest$ = DOM.get('.field', 'input')
    .debounce(500)
    .map(ev => ev.target.value)
    .filter(query => query.length > 0)
    .map(q => GITHUB_SEARCH_API + encodeURI(q));

  const otherRequest$ = Cycle.Rx.Observable.interval(1000).take(2)
    .map(() => ({url: GIPHY_SEARCH_API+'funny+cat&api_key=dc6zaTOxFJmzC&limit=1&offset=0', responseType: 'json', crossDomain: true}));

  const githubResponse$ = HTTP.get(GITHUB_SEARCH_API)
  const otherResponse$ = HTTP.get(GIPHY_SEARCH_API)

  otherResponse$.flatMapLatest(x => x).map(result => result.response.data[0].images.fixed_height.url)
  .subscribe(url =>{
    console.image(url);
  })

  const vtree$ = githubResponse$.flatMapLatest(x => x)
    .map(res => JSON.parse(res.response).items)
    .startWith([])
    .map(results =>
      h('div', [
        h('label.label', 'Search:'),
        h('input.field', {attributes: {type: 'text'}}),
        h('hr'),
        h('ul.search-results', results.map(result =>
          h('li.search-result', [
            h('a', {href: result.html_url}, result.name)
          ])
        ))
      ])
    );

  return {
    DOM: vtree$,
    // Request both api.github.com and google.com
    // endpoints. All HTTP requests should be sent to
    // this driver.
    HTTP: githubRequest$.merge(otherRequest$)
  };
}

Cycle.run(main, {
  DOM: CycleWeb.makeDOMDriver('.js-container'),
  HTTP: makeHTTPDriver()
});

console.image = (url) => console.log("%c+","font-size: 1px; padding: 100px 200px; line-height:200px; background-size: 200px 200px; background: url("+encodeURI(url)+")")

function logger (e, msg="") {
  console.log(msg, e)
  return e;
}