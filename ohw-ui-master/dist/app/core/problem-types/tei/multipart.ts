'use strict';

import * as $ from 'jquery';

export default function(DragAndDrop, Matching, DefaultProblemType) {

  var config = {
    fillIn: true,
    inject: {
      $: $,
      MathJax: MathJax
    },
    classes: {
    },
    imgSrc: '//qa1.perfectionlearning.com/media/'
  };


  function isDragDrop(part) {
    var filtered = part.filter((item) => { return item.name === 'dropBox'; });
    return filtered.length > 0;
  }

  function isMatching(part) {
    var filtered = part.filter((item) => { return item.name === 'matching'; });
    return filtered.length > 0;
  }

  function isOpenResponse(part) {
    //console.log('isOpenResponse?', part);
    var filtered = part.filter((item) => { return item.name === 'essayBlock'; });
    return filtered.length > 0;
  }

  function isEquationEditor(part) {
    //console.log('isEquationEditor?', part);
    var filtered = part.filter((item) => { return item.name === 'eqBox'; });
    return filtered.length > 0;
  }

  function makePartTitle(part) {
    //var partLetter = String.fromCharCode(65 + ndx);
    var titleContainer = document.createElement('div');
    titleContainer.className = 'partTitle';
    titleContainer.innerHTML = part.title; //'<b>Part ' + partLetter + '</b>';
    return titleContainer;
  }

  function makePartContent(content) {
    var container = document.createElement('div');
    container.className = 'partContainer';
    container.innerHTML = content;
    return container;
  }

  function processPart(multContainer, parts, ndx, prob) {
    var question = prob.q;
    var partTitle;
    var partContainer;
    var part = parts['part_' + ndx];

    if (isDragDrop(part)) {
      let dragDropQ = part.filter((item) => { return item.name === 'blank'; })[0].code;
      partTitle = makePartTitle(part);
      partContainer = makePartContent(dragDropQ);
      multContainer.appendChild(partTitle);
      multContainer.appendChild(partContainer);
    } else if (isMatching(part)) {
      //let q = part.filter((item) => { return item.name === 'matching'; })[0];
      let q = part.filter((item) => { return item.name === 'blank'; })[0].code;
      partTitle = makePartTitle(part);
      partContainer = makePartContent(q);
      multContainer.appendChild(partTitle);
      multContainer.appendChild(partContainer);
    } else if (isOpenResponse(part)) {
      //let promptQ = part.filter((item) => { return item.name === 'prompt'; })[0];
      let promptQ = part.filter((item) => { return item.name === 'blank'; })[0].code;
      partTitle = makePartTitle(part);
      partContainer = makePartContent(promptQ);
      multContainer.appendChild(partTitle);
      multContainer.appendChild(partContainer);
    } else if (isEquationEditor(part)) {
      //let q = part.filter((item) => { return item.name === 'eqBox'; })[0];
      let q = part.filter((item) => { return item.name === 'blank'; })[0];
      partTitle = makePartTitle(part);
      partContainer = makePartContent(q.code);
      multContainer.appendChild(partTitle);
      multContainer.appendChild(partContainer);
    } else {
      let q = DefaultProblemType.formatQ(part, prob, ndx);
      partTitle = makePartTitle(part);
      partContainer = makePartContent(q);
      multContainer.appendChild(partTitle);
      multContainer.appendChild(partContainer);
      //console.log('MultiPart question, unknown type', part);
    }
  }

  function processAnswerPart(multContainer, parts, ndx, prob) {
      var answer = prob.a;
      var partTitle;
      var partContainer;
      var part = parts['part_' + ndx];

      if (isDragDrop(part)) {
        let a = DragAndDrop.formatA(part);
        partTitle = makePartTitle(part);
        partContainer = makePartContent(a);
        multContainer.appendChild(partTitle);
        multContainer.appendChild(partContainer);
      } else if (isMatching(part)) {
        let a = Matching.formatA(part);
        partTitle = makePartTitle(part);
        partContainer = makePartContent(a);
        multContainer.appendChild(partTitle);
        multContainer.appendChild(partContainer);
      } else if (isOpenResponse(part)) {
        let a = part.filter((item) => { return item.name === 'answer'; })[0];
        partTitle = makePartTitle(part);
        partContainer = makePartContent(a.code);
        multContainer.appendChild(partTitle);
        multContainer.appendChild(partContainer);
      } else if (isEquationEditor(part)) {
        let a = part.filter((item) => { return item.name === 'answer'; })[0];
        partTitle = makePartTitle(part);
        partContainer = makePartContent(a.code);
        multContainer.appendChild(partTitle);
        multContainer.appendChild(partContainer);
      } else {
        let a = DefaultProblemType.formatA(part, prob, ndx);
        partTitle = makePartTitle(part);
        partContainer = makePartContent(a);
        multContainer.appendChild(partTitle);
        multContainer.appendChild(partContainer);
        //console.log('MultiPart answer, unknown type', part);
      }
  }

  function processSubPart(multContainer, parts, ndx, prob) {
      var submission = prob.orig_submission;
      var partTitle;
      var partContainer;
      var part = parts['part_' + ndx];

      if (isDragDrop(part)) {
        let sub = DragAndDrop.formatSub(part);
        partTitle = makePartTitle(part);
        partContainer = makePartContent(sub);
        multContainer.appendChild(partTitle);
        multContainer.appendChild(partContainer);
      } else if (isMatching(part)) {
        let sub = Matching.formatSub(part);
        partTitle = makePartTitle(part);
        partContainer = makePartContent(sub);
        multContainer.appendChild(partTitle);
        multContainer.appendChild(partContainer);
      } else if (isOpenResponse(part)) {
        let sub = part.filter((item) => { return item.name === 'submission'; })[0];
        partTitle = makePartTitle(part);
        partContainer = makePartContent(sub.code);
        multContainer.appendChild(partTitle);
        multContainer.appendChild(partContainer);
      } else if (isEquationEditor(part)) {
        let sub = part.filter((item) => { return item.name === 'submission'; })[0];
        partTitle = makePartTitle(part);
        partContainer = makePartContent(sub.code);
        multContainer.appendChild(partTitle);
        multContainer.appendChild(partContainer);
      } else {
        let sub = DefaultProblemType.formatSub(part, prob, ndx);
        partTitle = makePartTitle(part);
        partContainer = makePartContent(sub);
        multContainer.appendChild(partTitle);
        multContainer.appendChild(partContainer);
        //console.log('MultiPart submission, unknown type', part);
      }
  }

  // Create image element to include problem image directly after the question for formatQ.
  // This puts the image before, rather than after, the parts in a multipart problem.
  function createImage(img) {
    var el;
    if (typeof img === 'string' && /http/.test(img)) {
      el = document.createElement('div');
      var imgEl = document.createElement('img');
      imgEl.src = img;
      el.appendChild(imgEl);
    }
    return el;
  }

  function formatQ(prob, parts) {
    var probContainer = document.createElement('div');
    var qContainer = document.createElement('div');
    // Built an HTML container, and prepare to add the problem image.
    var qImage = createImage(prob.qImg);
    qContainer.innerHTML = prob.q;
    if (qImage) {
      qContainer.appendChild(qImage);
    }
    probContainer.appendChild(qContainer);

    config.fillIn = false;
    var multContainer = document.createElement('div');
    multContainer.className = 'multContainer';
    // I'm going to hate myself for this, but I'm in a bit of a hurry, so...
    var partNdx = 0;
    while (parts['part_' + partNdx]) {
      processPart(multContainer, parts, partNdx, prob);
      partNdx++;
    }
    probContainer.appendChild(multContainer);

    return probContainer.innerHTML;

  }

  function formatA(prob, parts) {
    var answer = prob.a;
    config.fillIn = true;
    var probContainer = document.createElement('div');
    var multContainer = document.createElement('div');
    multContainer.className = 'multContainer';
    var partNdx = 0;
    while (parts['part_' + partNdx]) {
      processAnswerPart(multContainer, parts, partNdx, prob);
      partNdx++;
    }

    probContainer.appendChild(multContainer);

    return probContainer.innerHTML;
  }

  function formatSub(prob, parts) {
    config.fillIn = false;

    var probContainer = document.createElement('div');
    var multContainer = document.createElement('div');
    multContainer.className = 'multContainer';
    var partNdx = 0;
    while (parts['part_' + partNdx]) {
      processSubPart(multContainer, parts, partNdx, prob);
      partNdx++;
    }

    probContainer.appendChild(multContainer);

    return probContainer.innerHTML;
  }

  return {
    formatQ: formatQ,
    formatA: formatA,
    formatSub: formatSub
  };
}
