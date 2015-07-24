'use strict';

var _ = require('lodash');

var events = require('./event');

exports.createUniqFilter = createUniqFilter;
exports.createValueFilter = createValueFilter;
exports.createRegExpFilter = createRegExpFilter;

/**
 * @param {string} key
 */
function createUniqFilter(key) {
  var items = {};
  return function(line) {
    var value = _.get(events.toObject(line), key);
    if (value === undefined || items[value]) {
      return false;
    }
    items[value] = true;
    return true;
  };
}

/**
 * @param {string|string[]} key
 * @param {*} value
 */
function createValueFilter(key, value) {
  var isBoolean = value === undefined;
  return function(line) {
    var _value = _.get(events.toObject(line), key);
    return isBoolean ? !!_value : value === _value;
  };
}

/**
 * @param {string} str
 */
function createRegExpFilter(str) {
  var regExp = new RegExp(str);
  return function(line) {
    line = _.isString(line) ? line : JSON.stringify(line);
    return regExp.test(line);
  };
}
