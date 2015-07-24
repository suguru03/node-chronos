'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('lodash');

_.forEach(fs.readdirSync(__dirname), function(filename) {
  if (path.extname(filename) === '.js' && filename !== 'index.js') {
    var jsname = path.basename(filename, '.js');
    exports[jsname] = require('./' + filename);
  } else if (fs.statSync(__dirname + '/' + filename).isDirectory()) {
    exports[filename] = require('./' + filename);
  }
});
