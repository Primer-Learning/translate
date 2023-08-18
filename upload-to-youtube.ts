#!/usr/bin/env deno run --allow-net=www.googleapis.com --allow-write --allow-read --allow-env

import { RS256, create as createJwt } from 'https://deno.land/x/djwt/mod.ts';
import { getEnvironmentVarible, read } from './utils.ts';

const API_KEY = getEnvironmentVarible('YOUTUBE_API_KEY');
const credentials = JSON.parse(
  await read('primer-translation-f8e874f8d794.json')
);

const jwt = await createJwt(
  { alg: 'RS256', typ: 'JWT' },
  {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform', // change this to the scope you need
    aud: 'https://oauth2.googleapis.com/token',
    exp: Date.now() / 1000 + 3600,
    iat: Date.now() / 1000,
  },
  new RS256(credentials.private_key)
);

const response = await fetch('https://oauth2.googleapis.com/token', {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  }),
});

console.log(await response.json());

// const lastPrimerVideo = '6YzrVUVO9M0';
// const matiasTestVideo = 'mm5n-iXf_9o';

// const existingCaptions = await getCaptionsFor(matiasTestVideo);

// console.log(existingCaptions);

// console.log(await insertCaptionsTo(matiasTestVideo));

async function createToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    }),
  });

  const json = await response.json();
}

async function getCaptionsFor(videoId: string) {
  const url = new URL('https://www.googleapis.com/youtube/v3/captions');
  url.searchParams.set('key', API_KEY);
  url.searchParams.set('videoId', videoId);

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const json = await response.json();
  return json?.items;
}

async function insertCaptionsTo(videoId: string) {
  const url = new URL('https://www.googleapis.com/youtube/v3/captions');
  url.searchParams.set('key', API_KEY);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snippet: {
        videoId,
        language: 'es',
        name: 'Spanish',
      },
    }),
  });

  const json = await response.json();
  return json;

  // You must specify a value for these properties:
  // - snippet.videoId
  // - snippet.language
  // - snippet.name
  //
  // You can set values for these properties:
  // - snippet.videoId
  // - snippet.language
  // - snippet.name
  // - snippet.isDraft
}
