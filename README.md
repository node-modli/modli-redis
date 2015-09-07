[![wercker status](https://app.wercker.com/status/5ec770d595a477b6c1bd7bac355c6dcc/s/master "wercker status")](https://app.wercker.com/project/bykey/5ec770d595a477b6c1bd7bac355c6dcc)
[![Code Climate](https://codeclimate.com/github/node-modli/modli-redis/badges/gpa.svg)](https://codeclimate.com/github/node-modli/modli-redis)
[![Test Coverage](https://codeclimate.com/github/node-modli/modli-redis/badges/coverage.svg)](https://codeclimate.com/github/node-modli/modli-redis/coverage)

# Modli - Redis Adapter

This module provides adapter for the [Redis](http://redis.io/)
datasource for integration with [Modli](https://github.com/node-modli).

## Installation

```
npm install modli-redis --save
```

## Config and Usage

When defining a property which will utilize the adapter it is required that a
`collection` be supplied:

```javascript
import { model, adapter, Joi, use } from 'modli';
import redis from 'modli-redis';

model.add({
  name: 'foo',
  version: 1,
  schema: {
    id: Joi.number().integer(),
    fname: Joi.string().min(3).max(30),
    lname: Joi.string().min(3).max(30),
    email: Joi.string().email().min(3).max(254).required()
  }
});
```

Then add the adapter as per usual with the following config object structure:

```javascript
adapter.add({
  name: 'redisFoo',
  source: redis
  config: {
    host: {HOST_IP},
    port: {HOST_PORT},
    password: {PASSWORD},
    opts: {OPTIONAL_PARAMS}
  }
});
```

You can then use the adapter with a model via:

```javascript
// Use(MODEL, ADAPTER)
const redisTest = use('foo', 'redisFoo');
```

## Methods

The following methods exist natively on the Redis adapter:

### `execute`

Allows for executing methods directly on the client:

```javascript
redisTest.execute('set', 'key-name', { /*...record...*/ })
  .then(/*...*/)
  .catch(/*...*/);
```

### `create`

Creates a new record based on object passed:

```javascript
redisTest.create('some-key', {
    fname: 'John',
    lname: 'Smith',
    email: 'jsmith@gmail.com'
  }, [version])
  .then(/*...*/)
  .catch(/*...*/);
```

### `read`

Returns records matching a key:

```javascript
redisTest.read('some-key', [version])
  .then(/*...*/)
  .catch(/*...*/);
```

### `update`

Updates record(s) based on key and body:

```javascript
redisTest.update('some-key', {
    fname: 'Bob',
    email: 'bsmith@gmail.com'
  }, [version])
  .then(/*...*/)
  .catch(/*...*/);
```

*Note: will create a new record if no existing record present*

### `delete`

Deletes record based on key:

```javascript
redisTest.delete('some-key')
  .then(/*...*/)
  .catch(/*...*/);
```

### `publish`

Publishes data to a channel:

```javascript
redisTest.publish('fooChannel', {
    fname: 'John',
    lname: 'Smith',
    email: 'jsmith@gmail.com'
  }, [version])
  .then(/*...*/)
  .catch(/*...*/);
```

### `extend`

Extends the adapter to allow for custom methods:

```javascript
redisTest.extend('myMethod', () => {
  /*...*/
});
```

## Development

The Redis adapter requires the following environment variables to be set for
running the tests. These should be associated with the Redis instance running
locally.

```
MODLI_REDIS_HOST,
MODLI_REDIS_PORT,
MODLI_REDIS_PASSWORD
```

This repository includes a base container config for running locally which is
located in the [/docker](/docker) directory.

## Makefile and Scripts

A `Makefile` is included for managing build and install tasks. The commands are
then referenced in the `package.json` `scripts` if that is the preferred
task method:

* `all` (default) will run all build tasks
* `start` will run the main script
* `clean` will remove the `/node_modules` directories
* `build` will transpile ES2015 code in `/src` to `/build`
* `test` will run all spec files in `/test/src`
* `test-cover` will run code coverage on all tests
* `lint` will lint all files in `/src`

## Testing

Running `make test` will run the full test suite. Since adapters require a data
source if one is not configured the tests will fail. To counter this tests are
able to be broken up.

**Test Inidividual File**

An individual spec can be run by specifying the `FILE`. This is convenient when
working on an individual adapter.

```
make test FILE=some.spec.js
```

The `FILE` is relative to the `test/src/` directory.

**Deploys**

For deploying releases, the `deploy TAG={VERSION}` can be used where `VERSION` can be:

```
<newversion> | major | minor | patch | premajor
```

Both `make {COMMAND}` and `npm run {COMMAND}` work for any of the above commands.

## License

Modli-Redis is licensed under the MIT license. Please see `LICENSE.txt` for full details.

## Credits

Modli-Redis was designed and created at [TechnologyAdvice](http://www.technologyadvice.com).