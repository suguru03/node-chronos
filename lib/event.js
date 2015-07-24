'use strict';

var _ = require('lodash');

exports.toObject = toObject;
exports.createValueGetter = createValueGetter;

function toObject(line) {
  return _.isPlainObject(line) ? line : JSON.parse(line);
}

/**
 * @param {string|string[]} key
 * @param {*} value
 */
function createValueGetter(key) {

  return function event(line) {
    return _.get(toObject(line), key);
  };
}
