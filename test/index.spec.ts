import * as supertest from 'supertest';


import app from '../src/index';


describe('サーバのテスト', () => {
  it('Path [/] のテスト', async () => {
    const res = await supertest(app).get('/');
    expect(res.text).toBe('Hello World');
  });
});
//こんな感じでapp.listen() をユニットテスト時に実行しないようにしておく
