// import Promise from 'bluebird';
import redis from 'redis';

/**
 * @class redis
 */
export default class {

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
