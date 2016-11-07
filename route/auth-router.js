'use strict';

const request = require('superagent');
const Router = require('express').Router;
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const debug = require('debug')('slugram:auth-router');
const basicAuth = require('../lib/basic-auth-middleware.js');
const User = require('../model/user.js');

// module constants
const authRouter = module.exports = Router();

authRouter.post('/api/signup', jsonParser, function(req, res, next){
  debug('POST /api/signup');

  let password = req.body.password;
  delete req.body.password;
  let user = new User(req.body);

  // checkfor password before running generatePasswordHash
  if (!password) 
    return next(createError(400, 'requires password'));
  if (password.length < 8) 
    return next(createError(400, 'password must be 8 characters'));

  user.generatePasswordHash(password)
  .then( user => user.save()) // check for unique username with mongoose unique
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});

authRouter.get('/api/login', basicAuth, function(req, res, next){
  debug('GET /api/login');

  User.findOne({username: req.auth.username})
  .then( user => user.comparePasswordHash(req.auth.password))
  .catch(err => Promise.reject(createError(401, err.message)))
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});

authRouter.get('/api/auth/oauth2_code', function(req, res, next){
  console.log('req.url', req.url);
  console.log('req.query', req.query);
  let tokenURL = 'https://www.googleapis.com/oauth2/v4/token';
  let data = {
    code: req.query.code,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.API_URL}/api/auth/oauth2_code`,
    grant_type: 'authorization_code',
  };

  console.log('data', data);
  request.post(tokenURL)
  .type('form')
  .send(data)
  .end((err, response) => {
    //console.log('boooya');
    //console.error(err);
    //if (err) return next(err);
    request.get('https://www.googleapis.com/plus/v1/people/me')
    .set('Authorization', `Bearer ${response.body.access_token}`)
    .end((err, data) => {
      console.log('res.body', data.body);

      res.redirect('/');
    })
  });

});
