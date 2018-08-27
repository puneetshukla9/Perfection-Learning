// if (typeof window === "undefined" || typeof window._ === "undefined") {
//     var _ = require("./underscore.js");
// } else {
//     _ = window._;
// }

var rng = require("./dg-mersenne-twister.js");

var mathTools = require("./math-tools.js");

var constMaxAttempts = 250;

var uniqueMaxAttempts = 50;

var mathFuncs = /(pow|sqrt|abs|log|sin|cos|tan|asin|acos|atan|floor|round|ceil)\(/g;

var extraFuncs = /(sind|cosd|tand|asind|acosd|atand|fact)\(/g;

function randomFromTo(from, to) {
    return Math.floor(rng.random() * (to - from + 1) + from);
}

function pickVar(args) {
    var min = args.min;
    var max = args.max;
    if (max < min) {
        var temp = min;
        min = max;
        max = temp;
    }
    var step = Math.abs(args.step) || 1;
    var delta = max - min;
    var totalSteps = Math.floor(delta / step);
    var choice = randomFromTo(0, totalSteps);
    var res = min + step * choice;
    return mathTools.fixJSMath(res);
}

function pickAllVars(vars) {
    var allVars = {
            sigDigs: {},
            sciNote: {}
        };
    for (var i = 0; i < vars.length; i++) {
        var args = {
                min: vars[i].min * 1,
                max: vars[i].max * 1,
                step: vars[i].step * 1,
                scinote: vars[i].scinote,
                sigdig: vars[i].sigdig
            };
        if (vars[i].label) {
            allVars[vars[i].label] = pickVar(args);
            if (typeof vars[i].sigdig !== "undefined") {
                allVars.sigDigs[vars[i].label] = vars[i].sigdig;
            }
            if (typeof vars[i].scinote !== "undefined") {
                allVars.sciNote[vars[i].label] = vars[i].scinote;
            }
        }
    }
    return allVars;
}

function varsToCode(obj) {
    var out = "";
    if (obj) {
        _.each(obj, function(val, key) {
            if (key && !isNaN(val)) {
                out += "var " + key + " = " + val + ";";
            }
        });
    }
    return out;
}

exports.varsToCode = varsToCode;

function constToCode(list) {
    var out = "";
    var regex = /[^=<>!]=(?!=)/g;
    if (list) {
        _.each(list, function(val, idx) {
            if (typeof val === "string" && val.length > 0) {
                var fixed = cleanMathString(val);
                var con = fixed.replace(regex, "$&=");
                out += "if (!(" + con + ")) pass = false;";
            }
        });
    }
    return out;
}

function doEvalTests(code) {
    var pass = true;
    try {
        eval(code);
    } catch (err) {
        pass = false;
    }
    return pass;
}

function getVarSet(constCode, vars, seed) {
    rng.init(seed);
    for (var loopIndex = 0; loopIndex < constMaxAttempts; loopIndex++) {
        var varList = pickAllVars(vars);
        var js = varsToCode(varList);
        if (doEvalTests(js + constCode)) {
            varList.seedUsed = seed;
            return varList;
        }
    }
    return {
        failed: true
    };
}

function varMatch(x, y) {
    for (var p in x) {
        if (p === "seedUsed" || p === "sigDigs" || p === 'sciNote') {
            continue;
        }
        if (!x.hasOwnProperty(p)) {
            continue;
        }
        if (!y.hasOwnProperty(p)) {
            return false;
        }
        if (x[p] === y[p]) {
            continue;
        }
        return false;
    }
    for (p in y) {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
            return false;
        }
    }
    return true;
}

function generateUnique(vars, constCode, seeds) {
    if (!(seeds.avoid instanceof Array)) {
        seeds.avoid = [ seeds.avoid ];
    }
    var oldVars = [];
    for (var i = 0; i < seeds.avoid.length; i++) {
        oldVars.push(getVarSet(constCode, vars, seeds.avoid[i]));
    }
    var seed = seeds.use !== undefined ? seeds.use : Date.now();
    for (var i = 0; i < uniqueMaxAttempts; i++) {
        var newVars = getVarSet(constCode, vars, seed);
        var unique = true;
        for (var compIdx = 0, len = oldVars.length; compIdx < len; compIdx++) {
            if (varMatch(newVars, oldVars[compIdx])) {
                unique = false;
                break;
            }
        }
        if (unique) {
            return newVars;
        }
        seed++;
    }
    return newVars;
}

function chooseVars(vars, constraints, seeds) {
    if (seeds === undefined) {
        seeds = {};
    }
    var constCode = constToCode(constraints);
    if (seeds.avoid !== undefined) {
        return generateUnique(vars, constCode, seeds);
    }
    var seed = seeds.use !== undefined ? seeds.use : new Date().getTime();
    return getVarSet(constCode, vars, seed);
}

exports.chooseVars = chooseVars;

function cleanMathString(string) {
    var out = string.replace("\u2212", "-");
    out = translateFuncs(out);
    return out;
}

exports.cleanMathString = cleanMathString;

function translateFuncs(str) {
    var replaced = str.replace(mathFuncs, "Math.$&");
    replaced = replaced.replace(extraFuncs, "mathTools.$&");
    var pi = /pi\(\)/g;
    replaced = replaced.replace(pi, "Math.PI");
    return replaced;
}
