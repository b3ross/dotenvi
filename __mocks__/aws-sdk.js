const MOCK_SECRET_MANAGER_SECRET_STORE = {
  singleString: 'foobar',
  jsonString: JSON.stringify({ foo: 'bar' })
};

class SecretsManagerMock {
  constructor() {
    this.secret = {};
  }

  getSecretValue({ SecretId }) {
    if (SecretId.includes('invalid')) {
      return Promise.reject('Invalid secret key');
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
