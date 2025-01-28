const express = require('express');
const validUrl = require('valid-url');
const shortid = require('shortid');
const Url = require('../models/Url');
const router = express.Router();

// POST /shorten
router.post('/shorten', async (req, res) => {
  const { longUrl, customId } = req.body;

  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    let existingUrl = await Url.findOne({ longUrl });

    if (existingUrl) {
      return res.json({ shortUrl: `${req.headers.host}/${existingUrl.shortId}` });
    }

    let shortId = customId;
    if (customId) {
      const pattern = /^[a-zA-Z0-9]{1,9}$/;
      if (!pattern.test(customId)) {
        return res.status(400).json({ error: 'Custom ID must be alphanumeric and no longer than 9 characters.' });
      }

      let existingCustomId = await Url.findOne({ shortId: customId });
      if (existingCustomId) {
        return res.status(400).json({ error: 'Custom ID is already in use.' });
      }
    }

    if (!shortId) {
      shortId = shortid.generate();
    }

    const newUrl = new Url({ longUrl, shortId });
    await newUrl.save();

    res.json({ shortUrl: `${req.headers.host}/${shortId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /:shortId
router.get('/:shortId', async (req, res) => {
  const { shortId } = req.params;

  try {
    const url = await Url.findOne({ shortId });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    url.accessCount = (url.accessCount || 0) + 1;
    await url.save();

    res.redirect(url.longUrl);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
