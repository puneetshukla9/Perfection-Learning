var trigRound = 15;

var ePattern = /e(.+)$/;

function sind(n) {
    return round(Math.sin(deg2rad(n)), trigRound);
}

exports.sind = sind;

function cosd(n) {
    return round(Math.cos(deg2rad(n)), trigRound);
}

exports.cosd = cosd;

function tand(n) {
    return round(Math.tan(deg2rad(n)), trigRound);
}

exports.tand = tand;

function asind(n) {
    return round(rad2deg(Math.asin(n)), trigRound);
}

exports.asind = asind;

function acosd(n) {
    return round(rad2deg(Math.acos(n)), trigRound);
}

exports.acosd = acosd;

function atand(n) {
    return round(rad2deg(Math.atan(n)), trigRound);
}

exports.atand = atand;

function fact(n) {
    var f = 1;
    n = Math.round(n);
    while (n >= 1) {
        f *= n--;
    }
    return f;
}

exports.fact = fact;

function deg2rad(d) {
    return d / 180 * Math.PI;
}

function rad2deg(r) {
    return r / Math.PI * 180;
}

function floor(rnum, rlength) {
    return Math.floor(rnum * Math.pow(10, rlength)) / Math.pow(10, rlength);
}

exports.floor = floor;

function usesSciNote(n) {
    return n.toString().indexOf("e") !== -1;
}

exports.usesSciNote = usesSciNote;

function fixJSMath(num) {
    if (num === undefined) {
        return num;
    }
    var mag = Math.floor(log10(Math.abs(num)));
    if (Math.abs(mag) === Infinity) {
        mag = 0;
    }
    var result = round(num, 10 - mag);
    if (usesSciNote(result))
      result = fixSciNote(result);
    return result;
}

exports.fixJSMath = fixJSMath;

function round(rnum, rlength) {
    return Math.round(rnum * Math.pow(10, rlength)) / Math.pow(10, rlength);
}

exports.round = round;

function roundFixed(rnum, rlength) {
    return round(rnum, rlength).toFixed(rlength);
}

exports.roundFixed = roundFixed;

// Intended to fix weirdness in scientific notation.
function fixSciNote(num) {
  var str = num.toString();
  var sliverUpRe = /^(\d)\.(\d{0,5}?)00000\d*(e\+\d+)$/;
  var sliverDnRe = /^(\d)\.(\d{0,5}?)99999\d*(e\+\d+)$/;
  var matchUp = sliverUpRe.exec(str);
  var matchDn = sliverDnRe.exec(str);
  if (matchUp) {
    var sliver = matchUp[2] ? '.' + matchUp[2] : '';
    var match = matchUp;
  } else if (matchDn) {
    sliver = '.' + parseInt(matchDn[2], 10) + 1;
    match = matchDn;
  } else {
    return num;
  }
  var digit = match[1];
  var sci = match[3];

  var corrected = digit + sliver + sci;
  return corrected;
}

function log10(val) {
    return Math.log(val) / Math.LN10;
}

function decimalVal(num) {
    num = +num;
    var data = String(num).split(/[eE]/);
    if (data.length === 1) {
        return data[0];
    }
    var z = "";
    var sign = num < 0 ? "-" : "";
    var str = data[0].replace(".", "");
    var mag = Number(data[1]) + 1;
    if (mag < 0) {
        z = sign + "0.";
        while (mag++) {
            z += "0";
        }
        return z + str.replace(/^\-/, "");
    }
    mag -= str.length;
    while (mag--) {
        z += "0";
    }
    return str + z;
}

exports.decimalVal = decimalVal;

function roundToSigFigs(num, sf) {
    if (sf < 1) {
        sf = 1;
    }
    if (sf > 21) {
        sf = 21;
    }
    var res = num.toPrecision(sf);
    if (res.indexOf("e") !== -1) {
        return decimalVal(res);
    }
    return res;
}

exports.roundToSigFigs = roundToSigFigs;

function getSignificantDigits(inputNum) {
    var num = Math.abs(inputNum) + "";
    if (isNaN(+num)) {
        throw new Error("getSignificantDigits(): number (" + num + ") is not a number.");
    }
    num = num.replace(/^0+/, "");
    var re = /[^0](\d*[^0])?/;
    var decimal = /\./.test(num);
    var match = num.match(re) || [ "" ];
    var sigDigits = decimal ? num.length - 1 : match[0].length;
    var sigPos = Math.floor(log10(num));
    if (num < 1 && decimal) {
        sigDigits = sigDigits + sigPos + 1;
    }
    return sigDigits;
}

exports.getSignificantDigits = getSignificantDigits;

function truncateToSigFigs(num, sf) {
    if (sf < 1) {
        sf = 99;
    }
    var res = num.toPrecision(sf);
    if (Math.abs(res) > Math.abs(num)) {
        var expNote = num.toExponential();
        var matches = ePattern.exec(expNote);
        if (matches) {
            var power = parseInt(matches[1], 10);
            var pow10 = Math.pow(10, power - sf + 1);
            var RoundOff = .5 * pow10;
            if (num < 0) {
                RoundOff = -RoundOff;
            }
            var res = (num - RoundOff).toPrecision(sf);
        }
    }
    if (res.indexOf("e") !== -1) {
        res = decimalVal(res);
    }
    return res;
}

exports.truncateToSigFigs = truncateToSigFigs;

function truncateToDecimals(num, dec) {
    if (dec < 1) {
        dec = 99;
    }
    var normalizedRoundOff = .5 / Math.pow(10, dec);
    var res = parseFloat((num - normalizedRoundOff).toFixed(dec));
    return res;
}

exports.truncateToDecimals = truncateToDecimals;
