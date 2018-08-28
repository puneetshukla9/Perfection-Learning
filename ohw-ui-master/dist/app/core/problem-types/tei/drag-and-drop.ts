'use strict';

//import * as $ from 'jquery';

export default function() {

  function formatQ(prob, els) {
    var blank = els.filter((item) => item.name === 'blank')[0].code;
    var qParts = [prob.q, blank];
    var q = qParts.join('');
    console.log('drag-and-drop formatQ qParts', qParts);
    return q;
  }

  function formatA(els) {
    var ans = els.filter((item) => item.name === 'answer')[0].code;
    return ans;
  }

  function formatSub(els) {
    var sub = els.filter((item) => item.name === 'submission');
    return sub[0].code;
  }

  return {
    formatQ: formatQ,
    formatA: formatA,
    formatSub: formatSub
  };
}
