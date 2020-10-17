import request from 'supertest';

import app from '../app';
import utils from './utils';

describe('Authenticated User should be able to create, read, update and update an entry at', () => {
  it('Should be able to create a diary entry at "/api/v1/entries" if input fields are valid', async () => {
    const { status, body: { data } } = await request(app).post('/api/v1/entries')
      .set('token', utils.user.mock2.token).send(utils.entry.mock);
    expect(status).toBeNumber().toEqual(201);
    expect(data).toBeObject().toContainKeys(['entry', 'status']);
    expect(data.status).toBeNumber().toEqual(201);
    expect(data.entry.title).toBeString().toEqual(utils.entry.mock.title);
    expect(data.entry.body).toBeString().toEqual(utils.entry.mock.body);
    expect(data.entry.id).toBeString();
  });

  it('Should not create an entry at "/api/v1/entries" if input fields are invalid', async () => {
    const { status, body: { error } } = await request(app).post('/api/v1/entries')
      .set('token', utils.user.mock2.token);
    expect(status).toBeNumber().toEqual(400);
    expect(error.messages).toBeArray().toIncludeAllMembers([
      {
        msg: 'Entry title should be at most 256 characters long',
        param: 'title',
        location: 'body',
      },
      {
        msg: 'Entry title must be string data type',
        param: 'title',
        location: 'body',
      },
      {
        msg: 'Entry title is required',
        param: 'title',
        location: 'body',
      },
      {
        msg: 'Entry body should be at least 1 character long',
        param: 'body',
        location: 'body',
      },
      {
        msg: 'Entry body must be string data type',
        param: 'body',
        location: 'body',
      },
      {
        msg: 'Entry body is required',
        param: 'body',
        location: 'body',
      },
    ]);
  });

  it('Should not create an entry at "/api/v1/entries" if token is falsy', async () => {
    const { status, body: { error } } = await request(app).post('/api/v1/entries')
      .send(utils.entry.mock);
    expect(status).toBeNumber().toEqual(400);
    expect(error.messages).toBeArray().toIncludeAllMembers([
      {
        msg: 'Token must be string data type',
        param: 'token',
        location: 'headers',
      },
      {
        msg: 'Token does not match Json Web Token format',
        param: 'token',
        location: 'headers',
      },
      {
        msg: 'Token is required',
        param: 'token',
        location: 'headers',
      },
    ]);
  });

  it('Should NOT create an entry at at "/api/v1/entries" if User is not authenticated', async () => {
    const { status, body: { error } } = await request(app).post('/api/v1/entries')
      .set('token', utils.user.mock2.token401).send(utils.entry.mock);
    expect(status).toBeNumber().toEqual(401);
    expect(error).toBeObject().toContainKeys(['message', 'status']);
    expect(error.message).toBeString().toEqual('User not found, please sign up by creating an account');
  });
});