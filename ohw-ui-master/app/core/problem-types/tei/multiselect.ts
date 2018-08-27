'use strict';

export default function() {

  function formatQ(prob, els) {
    var q = prob.q;
    var checkboxes = els.filter((item) => item.name === 'selectText');
    q = q + checkboxes[0].code;
    return q;
  }

  function formatA(els) {
    //var ans = els.filter((item) => item.name === 'answer');
    var ans = els.filter((item) => item.name === 'choices');
    return ans[0].code;
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
