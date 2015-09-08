import Promise from 'bluebird';
import redis from 'redis';
import NRP from 'node-redis-pubsub';

/**
 * @class redis
 */
export default class {

  /**
   * Sets up client for Redis connection
   * @param {Object} config
   * @property {String} config.host The host address or URI
   * @property {Number} [config.port] The port of the Redis instance
   * @property {String} [config.password] The password for the Redis instance
   */
  constructor (config) {
    config.port = config.port || 6379;
    // Standard client
    this.client = redis.createClient(config.port, config.host, config.opts);
    /* istanbul ignore else */
    if (config.password) {
      this.client.auth(config.password);
    }
    // Create pub-sub client
    const psConfig = {
      host: config.host,
      port: config.port,
      auth: config.password
    };
    this.clientPubSub = new NRP(psConfig);
  }

  /**
   * Executes a command against the client
   * @param {String} command The command to execute
   * @param {*} ...params Spread of args to command
   * @returns {Object} promise
   */
  execute (command, ...params) {
    return new Promise((resolve, reject) => {
      this.client[command](...params, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
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
  create (key, body, expires, version = false) {
    return new Promise((resolve, reject) => {
      const validationErrors = this.validate(body, version);
      if (validationErrors) {
        reject(validationErrors);
      } else {
        this.execute('set', key, JSON.stringify(body))
          .then((reply) => {
            if (expires) {
              this.client.expire(key, expires, (e) => {
                reject(e);
                return;
              });
            }
            resolve(reply);
          })
          .catch((err) => {
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
  read (key, version = false) {
    return new Promise((resolve, reject) => {
      this.execute('get', key)
        .then((reply) => {
          resolve(this.sanitize(JSON.parse(reply), version));
        })
        .catch(
          /* istanbul ignore next */
          (err) => { reject(err); }
        );
    });
  }

  /**
   * Alias's the create to overwrite existing record (or create new)
   * @param {String|Number} key The key to use
   * @param {Object} body The body/data to create in the hash
   * @param {String|Number} version The version of the model to validate
   * @returns {Object} promise
   */
  update (key, body, version = false) {
    return this.create(key, body, version);
  }

  /**
   * Deletes a record based on the key passed
   * @param {String|Number} key The key to delete
   * @returns {Object} promise
   */
  delete (key) {
    return this.execute('del', key);
  }

  /**
   * Publishes (validated) data to a channel
   * @param {String} channel The channel to publish to
   * @param {Object} body The body to publish
   * @param {String|Number} version The version of the model to validate
   * @returns {Object} promise
   */
  publish (channel, body, version = false) {
    const validationErrors = this.validate(body, version);
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
  subscribe (channel, fn, version = false) {
    this.clientPubSub.on(channel, (body) => {
      fn(this.sanitize(JSON.parse(body), version));
    });
  }

  /**
   * Extends adapter by adding new method
   * @param {String} name The name of the method
   * @param {Function} fn The method to add
   */
  extend (name, fn) {
    this[name] = fn.bind(this);
  }

}
