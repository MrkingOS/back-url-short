const request = require('supertest');
const app = require('../index');
const Url = require('../models/Url');

beforeEach(async () => {
  await Url.deleteMany({});
});

describe('POST /shorten', () => {
  it('should shorten a valid URL and return a short URL', async () => {
    const longUrl = 'https://www.youtube.com/watch?v=Y4z3psSbMEo';

    const response = await request(app)
      .post('/shorten')
      .send({ longUrl })
      .expect(200);

    expect(response.body.shortUrl).toContain('/');
  });

  it('should return an error for an invalid URL', async () => {
    const longUrl = 'invalid-url';

    const response = await request(app)
      .post('/shorten')
      .send({ longUrl })
      .expect(400);

    expect(response.body.error).toBe('Invalid URL');
  });
  
  it('should return a custom short ID if provided and valid', async () => {
    const longUrl = 'https://www.youtube.com/watch?v=Y4z3psSbMEo';
    const customId = 'custom123';

    const response = await request(app)
      .post('/shorten')
      .send({ longUrl, customId })
      .expect(200);

    expect(response.body.shortUrl).toContain(customId);
  });

it('should return an error if custom ID is already taken', async () => {
  let longUrl = 'https://www.youtube.com/watch?v=BbPo24gJmA8';
  const customId = 'custom123';

  await new Url({ longUrl, shortId: customId }).save();

  longUrl = 'https://www.youtube.com/watch?v=BbPo24gJmppA8';

  const response = await request(app)
    .post('/shorten')
    .send({ longUrl, customId })
    .expect(400);

  expect(response.body.error).toBe('Custom ID is already in use.');

});

  
});

describe('GET /:shortId', () => {
  it('should redirect to the long URL for a valid shortId', async () => {
    const longUrl = 'https://www.youtube.com/watch?v=Y4z3psSbMEo';
    const shortId = 'shortId123';
    const newUrl = new Url({ longUrl, shortId });
    await newUrl.save();

    const response = await request(app)
      .get(`/${shortId}`)
      .expect(302);

    expect(response.header.location).toBe(longUrl);
  });

  it('should return an error if the shortId is invalid', async () => {
    const response = await request(app)
      .get('/invalidId')
      .expect(302);

    expect(response.header.location).toBe('http://localhost:3001?error=invalid-url');
  });
});
