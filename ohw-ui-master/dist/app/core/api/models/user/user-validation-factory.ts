'use strict';

export default function() {

  var UserValidation = {};

  UserValidation.password = function(password) {
    var isValid = true;
    var minLength = 6;
    var checkSpace = /\s/g;
    var checkUpper = /[A-Z]/;
    var checkLower = /[a-z]/;
    var checkNumber = /[0-9]/;
    if (checkSpace.test(password)) isValid = false;
    if (password.length < minLength) isValid = false;
    if (!checkUpper.test(password)) isValid = false;
    if (!checkLower.test(password)) isValid = false;
    if (!checkNumber.test(password)) isValid = false;
    return isValid;
  };

  return UserValidation;

  };
