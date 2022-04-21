const fetch = jest.requireActual('cross-fetch');

export default jest.fn((...args: any[]) => fetch(...args));
