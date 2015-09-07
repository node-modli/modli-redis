/* eslint no-unused-expressions: 0 */
/* global expect, request, describe, it, before, after */
import '../setup';
import redis from '../../src/index';

const config = {
  host: process.env.MODLI_REDIS_HOST,
  port: process.env.MODLI_REDIS_PORT,
  password: process.env.MODLI_REDIS_PASSWORD
};

describe('redis', () => {
  describe('constructor', () => {
    it('throws error if invalid config passed', (done) => {
      expect(() => new redis({})).to.throw;
      done();
    });
    it('connects to redis instance with valid config', (done) => {
      const testConn = new redis(config);
      expect(testConn).to.be.an.object;
      expect(testConn.client.address).to.equal(`${config.host}:${config.port}`);
      done();
    });
  });
});
