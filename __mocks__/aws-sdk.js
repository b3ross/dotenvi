const MOCK_SECRET_MANAGER_SECRET_STORE = {
  singleString: 'foobar',
  jsonString: JSON.stringify({ foo: 'bar', nested: { foo: 'bar' } })
};

// Mock the AWS config object
const config = { region: 'us-east-1' };

class SecretsManagerMock {
  constructor() {
    this.secret = {};
  }

  getSecretValue({ SecretId }) {
    if (SecretId.includes('invalid')) {
      throw new Error("Secrets Manager can't find the specified secret.");
    }
    this.secret = { SecretString: MOCK_SECRET_MANAGER_SECRET_STORE[SecretId] };
    return this;
  }

  promise() {
    return Promise.resolve(this.secret);
  }
}

class CloudFormationMock {
  constructor() {
    this.stacks = {};
    this.timesCalled = 0;
  }

  describeStacks({ StackName }) {
    this.timesCalled += 1;
    if (StackName == 'throwError') {
      throw new Error('CloudFormation Error');
    } else if (StackName == 'notFound') {
      this.stacks = {
        Stacks: []
      };
    } else if (StackName == 'outputMissing') {
      this.stacks = {
        Stacks: [
          {
            Outputs: [
              {
                OutputKey: 'notFoo',
                OutputValue: 'bar'
              }
            ]
          }
        ]
      };
    } else {
      this.stacks = {
        Stacks: [
          {
            Outputs: [
              {
                OutputKey: 'foo',
                OutputValue: 'bar'
              }
            ]
          }
        ]
      };
    }
    return this;
  }

  promise() {
    return Promise.resolve(this.stacks);
  }
}

module.exports = {
  SecretsManager: SecretsManagerMock,
  CloudFormation: CloudFormationMock,
  config
};
