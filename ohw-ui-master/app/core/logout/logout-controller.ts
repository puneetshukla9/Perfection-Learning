'use strict';

export default function(AppState, Auth) {

  var subdomain, dest;

  var p = window.location.protocol;
  var w = window.location.hostname;
  var a, API = {};

  if (w === 'ohw.kineticmath.com' || w === 'qa3.kineticmath.com') {
  	subdomain = 'www';
//  	dest = encodeURIComponent(`${p}//${w}`);
    dest = p + '//' + w;
  } else {
  	subdomain = 'test';
  	if (w === 'localhost') w += ':8080';
  	dest = p + '//' + w; // 'http://qa2.kineticmath.com';
  }

  var LOGIN_URL = `${dest}/auth/main`;

  Auth.logout().then(() => {
    window.location.href = LOGIN_URL;
  }, () => {
    window.location.href = LOGIN_URL;
  });

  };
