import { ApidlyRequest } from '../types';
import { jsonRequest, jsonResponse, formRequest, textResponse } from '../dataTypes';

describe('Data types test suite', () => {
  it('Should make a json request', async () => {
    const url = new URL('https://apidly.io');
    const data = { test: 'test' };
    const request: ApidlyRequest<any, any> = { headers: new Headers(), data };
    await jsonRequest(url, request);
    expect(request.body).toEqual(JSON.stringify(data));
    expect(request.headers.get('content-type')).toEqual('application/json');
  });

  it('Should make a json response', async () => {
    const data = {};
    const response = new Response(JSON.stringify(data));
    const result = await jsonResponse(response);
    expect(result).toEqual(data);
  });

  it('Should catch a json response', async () => {
    const response = new Response('test');
    await jsonResponse(response).catch((e) => expect(e.message).toEqual('Unexpected token e in JSON at position 1\ntest'));
  });

  it('Should make a form request', async () => {
    const url = new URL('https://apidly.io');
    const data = { test: 'test' };
    const request: ApidlyRequest<any, any> = { headers: new Headers(), data };
    await formRequest(url, request);
    expect(request.body).toEqual('test=test');
    expect(request.headers.get('content-type')).toEqual('application/x-www-form-urlencoded');
  });

  it('Should make a text response', async () => {
    const data = 'text';
    const response = new Response(data);
    const result = await textResponse(response);
    expect(result).toEqual(data);
  });
});
