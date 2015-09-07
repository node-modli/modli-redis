/* eslint no-unused-expressions: 0 */
/* global expect, request, describe, it, before, after */
import '../setup';
import redis from '../../src/index';

const config = {
  host: process.env.MODLI_REDIS_HOST,
  port: process.env.MODLI_REDIS_PORT,
  password: process.env.MODLI_REDIS_PASSWORD
};

const testRedis = new redis(config);

// Mock validation method, this is automatically done by the model
testRedis.validate = (body) => {
  // Test validation failure by passing `failValidate: true`
  if (body.failValidate) {
    return { error: true };
  }
  // Mock passing validation, return null
  return null;
};

// Mock sanitize method, this is automatically done by the model
testRedis.sanitize = (body) => {
  return body;
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

  describe('create', () => {
    it('responds with failure if invalid data is passed', (done) => {
      testRedis.create('foo', { failValidate: true}, false, 1)
        .catch((err) => {
          expect(err.error).to.be.true;
          done();
        });
    });
    it('throws an error if invalid params passed', (done) => {
      expect(testRedis.create('fooFail', { foo: 'bar' }, 'fart')).to.throw;
      done();
    });
    it('creates a new record in the store', (done) => {
      testRedis.create('foo', { foo: 'bar' }, false, 1)
        .then((res) => {
          expect(res).to.equal('OK');
          done();
        });
    });
    it('creates a record that expires if numeric value set for expries param', (done) => {
      testRedis.create('fooExpires', { foo: 'bar'}, 30)
        .then((res) => {
          expect(res).to.equal('OK');
          done();
        });
    });
  });
});
