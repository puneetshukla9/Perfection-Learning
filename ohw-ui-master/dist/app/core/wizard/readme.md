# Wizard Widget
## Usage:
```
<div wizard-tabs w-id="uniqueId"></div>
<div wizard w-id="uniqueId" w-tabs="configCollection"></div>

$scope.configCollection = [
{ id: 'class', name: 'All Classes', state: 'classesList', disabled: false, active: true },
{ id: 'update', name: 'Class Details', state: 'editClass', disabled: false, fullScreen: true, drillOnly: true, active: false },
{ id: 'roster', name: 'Class Roster', state: 'classesStudents', disabled: false, fullScreen: true, active: false }
];
```
- id: unique identifier for the specific wizard tab
- name: name of the wizard tab
- state: the $state in which to navigate to ($stateParams are passed from one tab to another)
- disabled: tab is disabled
- active: tab is active
- drillOnly: tab can only be activated via drill
- fullscreen: the wizard-fullscreen class will be applied to the rendered view.

### Notes
- The wizard tab and wizard content are separate directives and communicate through a service. This allows for the tabbed interface to be displayed in a non-hierarchical location.
- Each node inside the wizard directive is rendered on a different tab.
- The tabs appear inside of the wizard-tabs

#### Dependencies
- Angular UI Router
