'use strict';

export default function() {

  function previewTweak(prob) {
		var re = /_scinote_10_exp_(.+?)_scinote_/;
		var re2 = /(-?\d+)e(-?\d+)/;
    var re3 = /_sup_10_exp_(.+?)_sup_/;
    if (prob.vtp) {
      if (typeof prob.vtp.q === 'string') {
        prob.vtp.q = prob.vtp.q.replace(re, '10<sup>$1</sup>');
        prob.vtp.q = prob.vtp.q.replace(re3, '10<sup>$1</sup>');
      }
      if (typeof prob.vtp.a === 'string') {
        prob.vtp.a = prob.vtp.a.replace(re, '<msup><mi>10</mi><mn>$1</mn></msup>');
    		prob.vtp.a = prob.vtp.a.replace(re2, '$1 x <msup><mi>10</mi><mn>$2</mn></msup>');
      }
    }

    return prob;
	}

  function editTweak(prob) {
    var re = /_scinote_10_exp_(.+?)_scinote_/g;
		var re2 = /(-?\d+)e(-?\d+)/g;
    var re3 = /_sup_10_exp_(.+?)_sup_/g;
    if (prob.vtp && typeof prob.vtp.q === 'string') {
      prob.vtp.q = prob.vtp.q.replace(re, '10<sup>$1</sup>');
      prob.vtp.q = prob.vtp.q.replace(re3, '10<sup>$1</sup>');
    }
    if (prob.vtp && typeof prob.vtp.a === 'string') {
      prob.vtp.a = prob.vtp.a.replace(re, '<msup><mi>10</mi><mn>$1</mn></msup>');
  		prob.vtp.a = prob.vtp.a.replace(re2, '$1 x <msup><mi>10</mi><mn>$2</mn></msup>');
    }
    if (prob.vtp.overlays) {
      prob.vtp.overlays.forEach((ovl) => {
        ovl.text = ovl.text.replace(re, '10<sup>$1</sup>');
      });
    }
    return prob;
  }

  return {
      previewTweak: previewTweak,
      editTweak: editTweak
  };

};
