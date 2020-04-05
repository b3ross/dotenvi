# dotenvi
A library for generating dotenv files

[![CircleCI](https://circleci.com/gh/b3ross/dotenvi/tree/master.svg?style=svg)](https://circleci.com/gh/b3ross/dotenvi/tree/master)
[![npm version](https://badge.fury.io/js/dotenvi.svg)](https://badge.fury.io/js/dotenvi)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Motivation
The library `dotenv` is a simple, convenient mechanism to add configuration to your node application.  With simplicity, however, comes drawbacks.  Dotenvi (pronounced "dotenvee") attempts to address those drawbacks.

Dotenvi defines all configuration at the root of your package in a yaml file called `env.yml`.

Use dotenvi to generate a .env file that plays nicely with dotenv without having to hack on top of dotenv to get it to support your needs.

## Installation

```
yarn add --dev dotenvi
```

## Usage

Define your configuration in a yaml file at the root of your application:

```yaml
default_env: &default_env
  SERVICE_URL: ${cft:my-stack.ServiceURL}  ## Reference to an AWS CFT stack output
  SOME_ENV_VARIABLE: ${env:SOME_ENV_VARIABLE}  ## Reference to an external environment variable
  SOME_CREDSTASH_VARIABLE: ${cred:SOME_CREDSTASH_VARIABLE}  ## Reference to a credstash key
  SOME_CONSTANT: SOME_CONSTANT
  OPTIONAL_VARIABLE:  ## Optional variable syntax.  Undefined variables will otherwise cause failures
    value: ${env:SOME_POSSIBLY_UNDEFINED_VARIABLE}
    optional: true
  ADVANCED_VALUE:  test-${env:SOME_ENV_VARIABLE}

development:
  <<: *default_env

staging:
  <<: *default_env

production:
  <<: *default_env
  SOME_CONSTANT: OVERRIDE_FOR_PRODUCTION
```

Then, run `yarn dotenvi -s <stage>` to generate a `.env` file for the stage desired (e.g., development, staging, production, etc...).  Use the generated `.env` file in your normal processes using [dotenv](https://github.com/motdotla/dotenv). 

Note that stages are not required in your yaml file - you can also define it without stages, in which case you should not specify a stage with the `-s` option when you run `dotenvi`.

## Recursion

Dotenvi supports recursion.  You can specify an expression that returns another expression.  For example, if the following environment variables are defined:

* `RECURSIVE_OUTER`: `${env:RECURSIVE_MIDDLE}-test`
* `RECURSIVE_MIDDLE`: `foo${env:RECURSIVE_INNER}bar${env:RECURSIVE_INNER}`
* `RECURSIVE_INNER`: `test`

If you evaluate `${env:RECURSIVE_OUTER}`, it will return `footestbartest-test`.

## Non-dotenv Output

Dotenvi can also output result files in json.  This supported via the `-t` switch that allows specifying either json or dotenv (dotenv is the default).

This supports a use case for people that are not interested in using .env, but still want the powerful lookup/replacement functionality that dotenvi supports.  The output file is named `dotenvi.json`.

## Configuration

In order to override default configuration, you can supply a `env.js` located next to your `env.yml`.  The format of this file is as follows:

```javascript
{
  awsRegion: '<aws-region>',
  resolvers: {
    test: value => {
      // transformation
      return transformed-value; // or promise
    }
  }
}
```

Resolvers specified in this file will allow you to expand on the current set of resolvers included in dotenvi (e.g., `env`, `cft`, etc...).  In the above example, the resolver `test` will match all references that look like `${test:some-value}`.

## Discussion

The main design goals of dotenvi are as follows:

1. Document ALL configuration for a project in a consistent and easy to find way.
2. Allow for environment variable generation from outside sources (such as AWS CFT outputs or other environment variables).
3. Allow for different "environments" or "stages".

## Additional Notes

I don't prescribe to the 12-factor application strategy that dotenv is based around, so please understand that this library may not completely follow that strategy.

The reference syntax used in `env.yml` is inspired by [serverless](https://github.com/serverless/serverless).