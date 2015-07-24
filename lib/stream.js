'use strict';

var fs = require('fs');
var readline = require('readline');
var util = require('util');

var _ = require('lodash');
var async = require('neo-async');

var EventEmitter = require('events').EventEmitter;
var EVENT_TYPES = {
  EVENT: 'event',
  FILTER: 'filter'
};

/**
 * @param {string} filepath - filepath
 */
function Stream(filepath) {
  this._filepath = filepath;
  this._events = [];
  this._stream = readline.createInterface({
    input: fs.ReadStream(filepath),
    output: {}
  });
}
util.inherits(Stream, EventEmitter);

/**
 * Add event to apply to per line
 * @param {Function|Function[]} func - event function
 * @param {Enum} [type='event'] - ['event', 'filter']
 * @param {boolean} [async=false]
 */
Stream.prototype.event = function(func, type, async) {
  var self = this;
  if (_.isPlainObject(func) || _.isArray(func)) {
    _.forEach(func, function(event) {
      self.event(event, type);
    });
    return self;
  }
  if (_.isFunction(func)) {
    var event = {
      func: func,
      type: type || EVENT_TYPES.EVENT,
      async: async || false
    };
    self._events.push(event);
  }
  return self;
};

/**
 * add filter event
 * @param {Function|Function[]} func
 */
Stream.prototype.filter = function(func) {
  return this.event(func, EVENT_TYPES.FILTER);
};

/**
 * Add async event
 * @param {Function|Function[]} func
 */
Stream.prototype.async = function(func) {
  return this.event(func, EVENT_TYPES.EVENT, true);
};

/**
 * Add async filter event
 * @param {Function|Function[]} func
 */
Stream.prototype.asyncFilter = function(func) {
  return this.event(func, EVENT_TYPES.FILTER, true);
};

/**
 * get data per line
 * @param {Function} callback
 */
Stream.prototype.line = function(callback) {
  this.on('line', callback);
  return this;
};

/**
 * get result
 * @param {Function} callback
 */
Stream.prototype.get = function(callback) {
  this
    .on('close', function(result) {
      callback(null, result);
    })
    .on('error', callback);
  return this;
};

/**
 * @alias get
 * @param {Function} callback
 */
Stream.prototype.result = function(callback) {
  return this.get(callback);
};

/**
 * execute baseline event and optional events
 */
Stream.prototype.execute = function() {
  var self = this;
  var data = [];
  self._stream
    .on('line', function(line) {
      async.everySeries(self._events, function(event, done) {
        var func = event.async ? event.func : function(line, callback) {
          callback(null, event.func(line));
        };
        switch (event.type) {
          case EVENT_TYPES.EVENT:
            return func(line, function(err, res) {
              if (err) {
                return done(err);
              }
              line = res;
              done(null, true);
            });
          case EVENT_TYPES.FILTER:
            return func(line, done);
        }
      }, function(err, bool) {
        if (err) {
          throw err;
        }
        if (!bool) {
          return;
        }
        data.push(line);
        self.emit('line', line);
      });
    })
    .on('close', function() {
      self.emit('close', data);
    })
    .on('error', function(e) {
      self.emit('error', e);
    })
    .resume();
  return self;
};

/**
 * @alias execute
 */
Stream.prototype.resume = function() {
  return this.execute();
};

exports.Stream = Stream;

exports.import = function(filepath, option, callback) {
  if (_.isFunction(option)) {
    callback = option;
    option = {};
  }
  callback = callback || _.noop;
  var stream = new Stream(filepath, option);
  return stream.execute().get(callback);
};
