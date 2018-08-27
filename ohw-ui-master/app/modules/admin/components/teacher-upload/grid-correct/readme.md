# Grid Correct Widget
## Usage:
```
This directive is designed to be used with UI Grid.
In your Angular UI Grid Cell Template, use the directive (something like):

var cellTemplate =
  '<div grid-correct="gridCorrectConfig" callback="resolveData"' +
  ' col="col" grid="grid" col-field="COL_FIELD" row="row.entity" custom-filters="CUSTOM_FILTERS">' +
  '</div>';

Then in the controller (this must be on the same $scope as the grid!):

$scope.gridCorrectConfig = {
  'first name': { // key in the table column definitions
    type: 'name', // type of validation
    validator: StudentUploadValidation.test, // a validator method (receives args: (type, value))
    resolver: StudentUploadValidation.fix // a resolver method (receives args: (key))
  },
  'last name': {
    type: 'name',
    validator: StudentUploadValidation.test,
    resolver: StudentUploadValidation.fix
  },
  'student id': {
    type: 'studentId',
    validator: StudentUploadValidation.test,
    resolver: StudentUploadValidation.fix
  },
  'username': {
    type: 'username',
    autoResolve: true, // will automatically resolve without any user input
    refresh: ['first name', 'last name'], // will refresh the auto resolved value on an array of items in the row
    overwrite: $scope.options && $scope.options.usernames, // boolean - will overwrite an existing value on auto resolution
    validator: StudentUploadValidation.test,
    resolver: StudentUploadValidation.generateUsername
  }
};

$scope.callback = function(name, value, row) {
  // need to set the data in the table according to the value passed back here
};
```

#### Dependencies
- Angular UI Grid (should work with or without editing)
