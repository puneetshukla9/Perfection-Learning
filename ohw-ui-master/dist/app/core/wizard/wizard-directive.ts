'use strict';

require('./wizard.less');
import * as $ from 'jquery';

export default function(Wizard, $state, $stateParams) {
    return {
      restrict: 'A',
      template: '<div class="full-height" ui-view></div>',
      link: function(scope, elem, attrs) {
        var
          id = attrs.wId,
          tabs = scope.$eval(attrs.wTabs);
        if (!id) throw Error('Id attribute must be specified for wizard.');
        if (!tabs) throw Error('Tabs attribute must be specified for wizard.');
        scope.wizard = {};
        Wizard.subscribe(id, function(wizard, activeTab) {
          var fullscreen;
          if (activeTab) {
            fullscreen = activeTab.fullScreen || false;
            if (fullscreen) {
              $(elem).addClass('wizard-fullscreen');
            } else {
              $(elem).removeClass('wizard-fullscreen');
            }
            scope.wizard.activeTab = activeTab.id;
            if (activeTab.state) {
              $state.transitionTo(activeTab.state, $stateParams);
            }
          }
        });
        Wizard.register(id, tabs);
      }
    };
  };
