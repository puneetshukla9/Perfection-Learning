'use strict';

export default function(PubSub) {

    var state = {
      viewFilter: {},
      classes: [],
      curClass: 0,
      teachers: [],
      administrators: [],
      userList: [],
      curUser: 0,
      curUserLevel: 1,
      schoolFilter: '',
      studentFilter: '',
      teacherFilter: '',
      reportFilter: {},
      curStandardType: 4

    };

    var State = {};

    State.get = function(key) {
      return applyFilter(key);
//      return _.cloneDeep(state[key]);
    };

    State.set = function(key, value) {
      if (!_.isEqual(state[key], value)) {
        state[key] = _.cloneDeep(value);
        PubSub.publish('StateChange:' + key, value);
      }
    };

    /*
     * States are set from the payload returned from a REST call.
     * The idea here is to use a filter to determine which values
     * one can get from a state. That way, it's not necessary to
     * perform the REST call each time a different filter is to be
     * applied.
     */
    var filters = {};

    // Applying the filter entails checking the filters hash for a filter to apply to the named State.
    // If a filter has been set, the State's array of objects is passed through the javascript
    // filter method, so each element can be compared with the specified filter values.
    function applyFilter(key) {
      var filtered = _.cloneDeep(state[key]);
      if (filters[key]) {
        var prop = filters[key].prop;
        var allowed = filters[key].filter;
        var filtered = filtered.filter((item) => {
          return allowed.indexOf(parseInt(item[prop], 10)) !== -1;
        });
      }

      return filtered;
    }

    // Filtering mechanism. Initially, to enable filtering of classes based on subject/product rowSelectionChanged
    // Each filter consists of a property and a filter array.
    // The property is expected to exist on the State object, and it must have a value that's in the filter array.
    State.setFilter = function(stateKey, prop, filter) {
      // Don't add an empty filter. This will hopefully clear up the bug of first class just added not showing up.
      if (filter.length > 0) {
        filters[stateKey] = {
          prop: prop,
          filter: filter
        };
      }
    };

    State.clearFilter = function(key) {
      delete filters[key];
    };

    return State;

  };
