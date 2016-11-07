'use strict';

require('./_home.scss');

module.exports = ['$log', HomeController ];

function HomeController($log){
  $log.debug('init homeCtrl');
  this.oneAtATime = true;

  let baseURL = 'https://accounts.google.com/o/oauth2/v2/auth';
  let clinetID = `client_id=${__GOOGLE_CLIENT_ID__}`
  let redirectURI =`redirect_uri=${__API_URL__}/api/auth/oauth2_code`;
  let responseType='response_type=code';
  let scope='scope=profile';
  let accessType = 'access_type=offline';
  this.loginURL = `${baseURL}?${clinetID}&${responseType}&${redirectURI}&${scope}&${accessType}`;
}
