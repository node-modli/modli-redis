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
  if (typeof body === 'object' && body.failValidate) {
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
    it('automatically uses the default port if none specified', (done) => {
      const testConn = new redis({ host: config.host, password: config.password });
      expect(testConn).to.be.an.object;
      expect(testConn.client.address).to.equal(`${config.host}:${config.port}`);
      done();
    });
    it('connects to redis instance with valid config', (done) => {
      const testConn = new redis(config);
      expect(testConn).to.be.an.object;
      expect(testConn.client.address).to.equal(`${config.host}:${config.port}`);
      done();
    });
  });

  describe('execute', () => {
    it('responds with an error if the command is undefined', (done) => {
      expect(() => { testRedis.execute('fart'); }).to.throw;
      done();
    });
    it('responds with an error if command is invalid', (done) => {
      testRedis.execute('set')
        .catch((err) => {
          expect(err).to.be.instanceof(Error);
          done();
        });
    });
    it('executes a command with passed params', (done) => {
      testRedis.execute('set', 'fooExec', 'hello')
        .then((reply) => {
          expect(reply).to.equal('OK');
          done();
        });
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
      testRedis.create('fooFail', undefined, false)
        .catch((err) => {
          expect(err).to.be.instanceof(Error);
          done();
        });
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

  describe('read', () => {
    it('returns the original object when found', (done) => {
      testRedis.read('foo', 1)
        .then((res) => {
          expect(res.foo).to.equal('bar');
          done();
        });
    });
    it('returns null when not found', (done) => {
      testRedis.read('fooNotExists')
        .then((res) => {
          expect(res).to.equal(null);
          done();
        });
    });
  });

  describe('update', () => {
    it('responds with failure if invalid data is passed', (done) => {
      testRedis.update('foo', { failValidate: true}, false, 1)
        .catch((err) => {
          expect(err.error).to.be.true;
          done();
        });
    });
    it('updates original record (if exists) or creates new', (done) => {
      testRedis.update('foo', { bar: 'foo2' }, 1)
        .then((res) => {
          expect(res).to.equal('OK');
          done();
        });
    });
  });

  describe('delete', () => {
    it('deletes a record from the datasource', (done) => {
      testRedis.delete('foo')
        .then((res) => {
          expect(res).to.be.a.number;
          done();
        });
    });
  });

  describe('publish', () => {
    it('responds with failure if invalid data is passed', () => {
      expect(testRedis.publish('fooChannel', { failValidate: true}, 1)).to.be.instanceof(Error);
    });
    it('publishes valid data to a channel', () => {
      expect(() => { testRedis.publish('fooChannel', { foo: 'bar' }); }).to.not.throw;
    });
  });

  describe('subscribe', () => {
    it('subscribes to a channel', (done) => {
      const testFn = (data) =>  {
        expect(data).to.deep.equal({ foo: 'bar' });
        done();
      };
      // Subscribe
      testRedis.subscribe('fooChannel', testFn, 1);
      // Publish
      testRedis.publish('fooChannel', { foo: 'bar' });
    });
  });

  describe('extend', () => {
    it('extends the object to allow for custom method', () => {
      // Extend
      testRedis.extend('myTestFn', () => {
        return 'foo';
      });
      // Test
      expect(testRedis.myTestFn()).to.equal('foo');
    });
  });
});
