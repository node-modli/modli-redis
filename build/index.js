'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _nodeRedisPubsub = require('node-redis-pubsub');

var _nodeRedisPubsub2 = _interopRequireDefault(_nodeRedisPubsub);

/**
 * @class redis
 */

var _default = (function () {

  /**
   * Sets up client for Redis connection
   * @param {Object} config
   * @property {String} config.host The host address or URI
   * @property {Number} [config.port] The port of the Redis instance
   * @property {String} [config.password] The password for the Redis instance
   */

  function _default(config) {
    _classCallCheck(this, _default);

    config.port = config.port || 6379;
    // Standard client
    this.client = _redis2['default'].createClient(config.port, config.host, config.opts);
    /* istanbul ignore else */
    if (config.password) {
      this.client.auth(config.password);
    }
    // Create pub-sub client
    var psConfig = {
      host: config.host,
      port: config.port,
      auth: config.password
    };
    this.clientPubSub = new _nodeRedisPubsub2['default'](psConfig);
  }

  /**
   * Executes a command against the client
   * @param {String} command The command to execute
   * @param {*} ...params Spread of args to command
   * @returns {Object} promise
   */

  _createClass(_default, [{
    key: 'execute',
    value: function execute(command) {
      var _this = this;

      for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
      }

      return new _bluebird2['default'](function (resolve, reject) {
        var _client;

        (_client = _this.client)[command].apply(_client, params.concat([function (err, reply) {
          if (err) {
            reject(err);
          } else {
            resolve(reply);
          }
        }]));
      });
    }

    /**
     * Creates a record based on body object
     * @param {String|Number} key The key to use
     * @param {Object} body The body/data to create in the hash
     * @param {Number} expires The duration before expiration (in seconds)
     * @param {String|Number} version The version of the model to validate
     * @returns {Object} promise
     */
  }, {
    key: 'create',
    value: function create(key, body, expires) {
      var _this2 = this;

      var version = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

      return new _bluebird2['default'](function (resolve, reject) {
        var validationErrors = _this2.validate(body, version);
        if (validationErrors) {
          reject(validationErrors);
        } else {
          _this2.execute('set', key, JSON.stringify(body)).then(function (reply) {
            if (expires) {
              _this2.client.expire(key, expires, function (e) {
                reject(e);
                return;
              });
            }
            resolve(reply);
          })['catch'](function (err) {
            reject(err);
          });
        }
      });
    }

    /**
     * Reads from record based on key
     * @param {String|Number} key The key to find
     * @param {String|Number} [version] The model version to sanitize against
     * @returns {Object} promise
     */
  }, {
    key: 'read',
    value: function read(key) {
      var _this3 = this;

      var version = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      return new _bluebird2['default'](function (resolve, reject) {
        _this3.execute('get', key).then(function (reply) {
          resolve(_this3.sanitize(JSON.parse(reply), version));
        })['catch'](
        /* istanbul ignore next */
        function (err) {
          reject(err);
        });
      });
    }

    /**
     * Alias's the create to overwrite existing record (or create new)
     * @param {String|Number} key The key to use
     * @param {Object} body The body/data to create in the hash
     * @param {String|Number} version The version of the model to validate
     * @returns {Object} promise
     */
  }, {
    key: 'update',
    value: function update(key, body) {
      var version = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      return this.create(key, body, version);
    }

    /**
     * Deletes a record based on the key passed
     * @param {String|Number} key The key to delete
     * @returns {Object} promise
     */
  }, {
    key: 'delete',
    value: function _delete(key) {
      return this.execute('del', key);
    }

    /**
     * Publishes (validated) data to a channel
     * @param {String} channel The channel to publish to
     * @param {Object} body The body to publish
     * @param {String|Number} version The version of the model to validate
     * @returns {Object} promise
     */
  }, {
    key: 'publish',
    value: function publish(channel, body) {
      var version = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var validationErrors = this.validate(body, version);
      /* istanbul ignore else */
      if (validationErrors) {
        return new Error(validationErrors);
      }
      this.clientPubSub.emit(channel, JSON.stringify(body));
    }

    /**
     * Subscribes to a channel, parses/sanitizes data on event
     * @param {String} channel The channel to subscribe to
     * @param {Function} fn The function to call on event
     * @param {String|Number} version The version on the model to sanitize
     */
  }, {
    key: 'subscribe',
    value: function subscribe(channel, fn) {
      var _this4 = this;

      var version = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      this.clientPubSub.on(channel, function (body) {
        fn(_this4.sanitize(JSON.parse(body), version));
      });
    }

    /**
     * Extends adapter by adding new method
     * @param {String} name The name of the method
     * @param {Function} fn The method to add
     */
  }, {
    key: 'extend',
    value: function extend(name, fn) {
      this[name] = fn.bind(this);
    }
  }]);

  return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];