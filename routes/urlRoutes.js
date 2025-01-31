const express = require('express');
const validUrl = require('valid-url');
const shortid = require('shortid');
const Url = require('../models/Url');
const router = express.Router();

// POST /shorten
router.post('/shorten', async (req, res) => {
  const { longUrl, customId } = req.body;

  if (!isValidUrl(longUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    let exUrl = await Url.findOne({ longUrl });

    if (exUrl) {
      return res.json({ shortUrl: `${req.headers.host}/${exUrl.shortId}` });
    }

    if (customId) {
      const existingcustomId = await Url.findOne({ shortId: customId });
      if (existingcustomId) {
        return res.status(409).json({ error: 'Custom ID is already in use.' });
      }
    }

    const shortId = customId || generateShortId();
    const newUrl = new Url({ longUrl, shortId });
    await newUrl.save();

    res.status(200).json({ shortUrl: `${req.protocol}://${req.get('host')}/${shortId}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


function isValidUrl(url) {
  return validUrl.isUri(url);
}

function generateShortId() {
  return shortid.generate();
}

// GET /:shortId
router.get('/:shortId', async (req, res) => {
  const { shortId } = req.params;

  try {
    const url = await Url.findOne({ shortId });

    if (!url) {
      return res.redirect(`https://front-url-short.vercel.app?error=invalid-url`);
    }

    url.accessCount = (url.accessCount || 0) + 1;
    await url.save();

    res.redirect(url.longUrl);
  } catch (err) {
    res.redirect(`https://front-url-short.vercel.app?error=server-error`);
  }
});


module.exports = router;
