'use strict';

 export default function($scope, $state) {

    var file = $state.params.data;
    var self = this;

    self.changeData = function() {
      $state.go('adminApp.teacherUpload.uploadTable', { data: file, changes: { usernames: true } });
    };

    self.keepData = function() {
      $state.go('adminApp.teacherUpload.uploadTable', { data: file, changes: { usernames: false } });
    };

  };
