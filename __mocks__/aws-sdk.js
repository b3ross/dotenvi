const MOCK_SECRET_MANAGER_SECRET_STORE = {
  singleString: 'foobar',
  jsonString: JSON.stringify({ foo: 'bar', nested: { foo: 'bar' } })
};

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

module.exports = {
  SecretsManager: SecretsManagerMock
};
