[![wercker status](https://app.wercker.com/status/5ec770d595a477b6c1bd7bac355c6dcc/s/master "wercker status")](https://app.wercker.com/project/bykey/5ec770d595a477b6c1bd7bac355c6dcc)
[![Code Climate](https://codeclimate.com/github/node-modli/modli-redis/badges/gpa.svg)](https://codeclimate.com/github/node-modli/modli-redis)
[![Test Coverage](https://codeclimate.com/github/node-modli/modli-redis/badges/coverage.svg)](https://codeclimate.com/github/node-modli/modli-redis/coverage)

> # ATTENTION: In Development

> This repository is currently in development.

# Modli - Redis Adapter

This module provides adapter for the [Redis](http://redis.io/)
datasource for integration with [Modli](https://github.com/node-modli).

## Installation

```
npm install modli-redis --save
```

## Usage

```javascript
import { model, adapter, Joi, use } from 'modli';
import { redis } from 'modli-redis';

// Create a model
model.add({
  name: 'testModel',
  version: 1,
  schema: {
    /* ...schema properties... */
  }
});

// Add adapter using NeDB
model.add({
  name: 'testRedis',
  source: redis
  config: {
    /*...*/
  }
});

const testModli = use('testModel', 'testRedis');
```

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