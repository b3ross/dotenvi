# dotenvi
A simple library for generating dotenv files

## Motivation
Dotenv is a library for adding configuration to your node application.  With simplicity, however, comes drawbacks.  Dotenvi is a library for attempting to address those drawbacks.

Dotenvi defines all configuration at the root of your package in a yaml file called `env.yml`.  References to other variable definitions are done in a format inspired by [serverless](https://github.com/serverless/serverless).

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
  SOME_CONSTANT: SOME_CONSTANT

development:
  <<: *default_env

staging:
  <<: *default_env

production:
  SOME_CONSTANT: OVERRIDE_FOR_PRODUCTION
  <<: *default_env
```

Then, simply run `yarn dotenvi` to generate a `.env` file.  Use this `.env` file in your normal processes using `dotenv`.  Use `yarn dotenvi` as an initial step in your CI processes to lay down the configuration for your application, or to ready an application for deployment.


## Discussion

The main design goals of dotenvi are as follows:

1. Document all configuration in a consistent and easy to find way.
2. Allow for environment variable generation from outside sources (such as AWS CFT outputs or other environment variables).
3. Allow for different "environments" or "stages".
4. Play nicely with dotenv.

## Note

I don't prescribe to the 12-factor application strategy that dotenv is based around, so please understand that this library may not completely follow that strategy.

## Possible Future Work

1. Support for user-defined resolvers (e.g., other than `cft` and `env`).
2. Allow for `dotenvi` to replace `dotenv`, if desired, by skipping the `.env`-generation step.
3. Support for references embedded within a configuration value (e.g., `foo-${env:BAR}` --> `foo-bar` if BAR=bar)
4. Support recursive reference calls (e.g., `${env:${env:FOO}}`)
