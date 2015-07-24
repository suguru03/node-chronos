node-chronos
--

node-chronos is tool for large log analysis.

## example

```js
node example/simple.js
```

```js
var chronos = require('node-chronos');

chronos.stream
  .import(filepath)
  .event(events)  // convert data per line
  .filter(filters) // filter data
  .async(asyncEvents) // convert data on asynchronous
  .asyncFilter(asyncFilterEvents) // filter data on asynchronous
  .get(function(err, result) {
    // get result
  });
```
