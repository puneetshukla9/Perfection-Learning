'use strict';

export default function() {

    var CSV = {};

    var getIndex = function(headers, column) {
      _.each(headers, function(row, i) {
        headers[i] = row.toLowerCase();
      });
      var index = _.indexOf(headers, column.toLowerCase());
      if (index >= 0) {
        return index;
      } else {
        return false;
      }
    };

    CSV.columnDataPresent = function(csv, column) {
      var headers = csv.data[0];
      var data = csv.data.slice(1, csv.data.length);
      var index = getIndex(headers, column);
      var results = [];
      _.each(data, function(row, i) {
        results.push(row[index]);
      });
      return _.some(results);
    };

    CSV.generateData = function(csv, column, generator) {
      var headers = csv.data[0];
      var data = csv.data.slice(1, csv.data.length);
      var index = getIndex(headers, column);
      var results = [];
      results.push(headers);
      _.each(data, function(row, i) {
        row[index] = generator(row, headers);
        results.push(row);
      });
      return results;
    };

    CSV.convertToGridObject = function(csv) {
      if (!csv) return;
      var headers = csv[0];
      var data = csv.slice(1, csv.length);
      data = _.filter(data, function(row) { return row.length > 1 || row[0] > ''; }); // eliminate blank rows
      var result = [];
      for (var row in data) {
        var obj = {};
        for (var i = 0; i < headers.length; i++) {
          obj[headers[i]] = data[row][i];
        }
        result.push(obj);
      }
      return result;
    };

    return CSV;

  };
