// import Promise from 'bluebird';
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
        if (err) {
          throw new Error(err);
        }
      });
    }
  }

}
