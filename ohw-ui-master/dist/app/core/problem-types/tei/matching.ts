'use strict';

export default function() {

  function formatQ(prob, els) {
    var q = prob.q;
    var matching = els.filter((item) => item.name === 'blank')[0].code;
    q = q + matching;
    return q;
  }

  function formatA(els) {
    //var ans = els.filter((item) => item.name === 'matching');
    var ans = els.filter((item) => item.name === 'answer')[0].code;
    return ans;
  }

  function formatSub(els) {
    var sub = els.filter((item) => item.name === 'submission')[0].code;
    return sub;
  }

  return {
    formatQ: formatQ,
    formatA: formatA,
    formatSub: formatSub
  };
}
