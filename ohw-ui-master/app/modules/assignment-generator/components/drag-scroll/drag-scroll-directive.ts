'use strict';

export default function(AssignmentHelper, $timeout, $window) {

  var sortOptions = {
    orderChanged: sorted,
    dragMove: scrollDrag,
    containment: '#sortable',
    containerPositioning: 'relative',
    belowOffset: 30,
    aboveOffset: 75,
    scrollDist: 20,
    timerInterval: 25
  };

  var lastYPos;
  var cancelScroll;

  function scrollDrag(itemPosition, containment, eventObj) {
    cancelScroll = false;
    lastYPos = eventObj.clientY;
    var below = lastYPos > $window.innerHeight - sortOptions.belowOffset;
    var above = lastYPos < sortOptions.aboveOffset;
    if (below || above) {
      scrollViewport(eventObj, below ? sortOptions.scrollDist : -sortOptions.scrollDist);
    }
  }

  function scrollViewport(eventObj, scrollAmount) {
    $window.scrollBy(0, scrollAmount);
    $timeout(function() {
      if (continueScrolling(eventObj)) {
        scrollViewport(eventObj, scrollAmount);
      }
    }, sortOptions.timerInterval);
  }

  function continueScrolling(eventObj) {
    var yPos = eventObj.clientY;
    var topFold = sortOptions.aboveOffset;
    var bottomFold = $window.innerHeight - sortOptions.belowOffset;
    var keepScrolling = !cancelScroll && yPos === lastYPos && (yPos > bottomFold || yPos < topFold);
    return keepScrolling;
	}

  function sorted(evt) {
    var from = evt.source.index;
    var to = evt.dest.index;
    AssignmentHelper.moveProblem(from, to);
  }

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      // Sortable options
      scope.sortOptions = sortOptions;

      // Determine when mouse is active in viewport, in which case, any scrolling from drag should cease.
      scope.captureMouse = function() {
        cancelScroll = true;
      };
    }

  };

};
