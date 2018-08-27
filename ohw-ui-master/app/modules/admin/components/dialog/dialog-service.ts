'use strict';

export default function($uibModal, State) {

	var kbDialog = {};

	kbDialog.showDialog = function(configObject) {

		var
			stateName = configObject.stateName,
			type = configObject.type,
			title = configObject.title,
			message = configObject.message,
			data = configObject.data,
			template = configObject.template;

		if (!type) throw new Error('Type must be specified.');

		var newDlg = {
			title: title,
			msg: message
		};

		var dlg = {
			title: title,
			msg: message
		};

		if (stateName)
			dlg.stateName = stateName;

		State.set('curDlg', dlg);

		var result = $uibModal.open({
			templateUrl: template ? template : require('./templates/dialog' + type + '.html'),
			controller: 'dialogCtrl as ctrl',
			resolve: {
				data: function() {
					return data || [];
				}
			}
		});

		return result;

	};

	return kbDialog;

};
