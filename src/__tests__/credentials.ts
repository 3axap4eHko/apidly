import { createCredentials, CredentialsResult } from '../credentials';

describe('Credentials test suite', () => {
  it('Should throw an error', () => {
    const credentials: CredentialsResult<any> = {
      credentials: null,
      expires: 0,
    };
    expect(createCredentials(async() => credentials)).toThrowError();
  })
});
