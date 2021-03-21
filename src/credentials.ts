export interface CredentialsResult<C> {
  credentials: C;
  expires: number;
}

export interface FetchCredentials<C> {
  (): Promise<CredentialsResult<C>>;
}

export interface CredentialsOptions {

}

export function createCredentials<C>(fetchCredentials: FetchCredentials<C>): any {
  return () => {
    throw new Error('not implemented yet');
  }
}
