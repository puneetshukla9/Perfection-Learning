'use strict';

import * as $ from 'jquery';

export default function($state, $window, $stateParams, Course) {

  var parts = window.ohw.originalRequest.split('/');
	var index = parts.indexOf('manuals');

	var filename = parts[index + 1]; //'a1_tm_natl.pdf'; // parts[index + 1];

  var prodId = filename.split('_')[0];
  var partId = filename.indexOf('_natl.pdf') >= 0 ? 0 : 1;

  Course.getManual(prodId, partId)
    .then(function (res) {
      var file = new Blob([res.data], {
          type : 'application/pdf'
      });
      $('#pdf-container > h2').hide();

      if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(file, 'kineticmath-manual.pdf');
      } else {
        var fileURL = URL.createObjectURL(file);
        var iframe = document.createElement('iframe');
        iframe.id = 'showPDF';
        iframe.src = fileURL;
        document.getElementById('pdf-container').appendChild(iframe);
      }
    });


};
