import Promise from 'bluebird';
import redis from 'redis';

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
    this.client = redis.createClient(config.port, config.host, config.opts);
    if (config.password) {
      this.client.auth(config.password, (err) => {
        /* istanbul ignore if */
        if (err) {
          throw new Error(err);
        }
      });
    }
  }

  /**
   * Creates a hash set based on body object
   * @param {String|Number} key The key to use
   * @param {Object} body The body/data to create in the hash
   * @param {Number} expires The duration before expiration (in seconds)
   * @param {String|Number} version The version of the model to validate
   */
  create (key, body, expires, version = false) {
    return new Promise((resolve, reject) => {
      const validationErrors = this.validate(body, version);
      if (validationErrors) {
        reject(validationErrors);
      } else {
        this.client.set(key, JSON.stringify(body), (err, reply) => {
          /* istanbul ignore if */
          if (err) {
            reject(err);
          } else {
            if (expires) {
              this.client.expire(key, expires, (e) => {
                reject(e);
                return;
              });
            }
            resolve(reply);
          }
        });
      }
    });
  }

}
