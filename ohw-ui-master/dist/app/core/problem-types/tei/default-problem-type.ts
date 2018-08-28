'use strict';

export default function() {

  function formatQ(els, prob, ndx) {
    var partQ = els.filter((item) => item.name === 'blank')[0].code;
    var q = partQ;
    return q;
  }

  function formatA(els, prob, ndx) {
    var partAns = els.filter((item) => item.name === 'answer')[0].code;
    return partAns;
  }

  function formatSub(els, prob, ndx) {
    var partSub = els.filter((item) => item.name === 'submission')[0].code;
    return partSub;
  }

  return {
    formatQ: formatQ,
    formatA: formatA,
    formatSub: formatSub
  };
}
