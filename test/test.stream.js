'use strict';

var path = require('path');
var assert = require('assert');

var _ = require('lodash');

var filepath = path.resolve(__dirname, 'data/sample.log');
var jobList = ['engineer', 'none', 'samurai'];

var chronos = require('../');

describe('stream', function() {

  var Stream = chronos.stream.Stream;

  describe('#get', function() {

    it('should get all log data', function(done) {

      var stream = new Stream(filepath);
      stream.get(function(err, result) {
        if (err) {
          return done(err);
        }
        var data = _.first(result);
        assert.ok(_.isString(data));
        assert.strictEqual(result.length, 10000);
        done();
      });
    });
  });

  describe('#event', function() {

    it('should convert string to object', function(done) {

      var stream = new Stream(filepath);
      var convert = function(line) {
        return JSON.parse(line);
      };

      stream
        .event(convert)
        .get(function(err, result) {
          if (err) {
            return done(err);
          }
          var data = _.first(result);
          assert.ok(_.isPlainObject(data));
          assert.deepEqual(_.keys(data), ['_id', 'name', 'job']);
          assert.strictEqual(result.length, 10000);
          done();
        });
    });
  });

  describe('#filter', function() {

    it('should get filtered list', function(done) {

      var stream = new Stream(filepath);
      var job = _.first(jobList);
      var regExp = new RegExp(job);
      var filter = function(line) {
        return regExp.test(line);
      };

      stream
        .filter(filter)
        .get(function(err, result) {
          if (err) {
            return done(err);
          }
          var data = _.first(result);
          assert.ok(_.isString(data));
          assert.strictEqual(result.length, 3193);
          done();
        });
    });
  });

});
