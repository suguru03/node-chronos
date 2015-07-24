'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('lodash');

var chronos = require('../');

var filepath = path.resolve(__dirname, '../logs/simple.log');

var filters = [
  chronos.filter.createUniqFilter('_id'),
];
var events = [
  chronos.event.createValueGetter('_id')
];

// create simple log
var log = '';
_.times(10000, function(n) {
  log += JSON.stringify({
    _id: Math.floor(n / 2),
    name: n
  }) + '\n';
});
fs.writeFileSync(filepath, log, { encoding: 'utf8' });

chronos.stream
  .import(filepath)
  .filter(filters)
  .event(events)
  .get(function(err, result) {
    console.log(result);
  });
