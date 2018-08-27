// if (typeof window === "undefined" || typeof window._ === "undefined") {
//     var _ = require("./underscore.js");
// } else {
//     _ = window._;
// }

var mathTools = require("./math-tools.js");

var varSelect = require("./var-select.js");

var varSub = require("./var-sub.js");

var ruleSets = {
        math: {
            sciNoteByMag: false,
            useVarsForNonSNSigFigs: false,
            nonSNRoundMethod: "DP",
            nonSNRoundCount: 3
        },
        physics: {
            sciNoteByMag: true,
            useVarsForNonSNSigFigs: true,
            nonSNRoundMethod: "SF",
            nonSNRoundCount: 2
        }
    };

var snRules = {
        maxSigDigSN: 2,
        useSNAtOrAbove: 1e4,
        useSNBelow: .001
    };

var sciRegExp = /([0-9]\.)?[0-9]+[eE][+-][0-9]+/g;

var findFlags = /,[^)]*$/;

var curRules = "physics";

var curVars;

function stripFlags(block) {
    var idx = block.search(findFlags);
    if (idx === -1) {
        return block;
    }
    return block.substring(0, idx);
}

function getVarUsage(block) {
    block = stripFlags(block);
    block = block.replace(sciRegExp, "_");
    var used = [];
    _.each(curVars, function(val, key) {
        var isSci = false;
        var regExp = new RegExp("([^a-zA-Z]|^)" + key + "([^a-zA-Z]|$)");
        if (block.search(regExp) !== -1) {
            used.push(key);
        }
    });
    return used;
}

function getFlags(string) {
    var idx = string.search(findFlags);
    if (idx === -1) {
        idx = 1e4;
    }
    var opts = string.substring(idx + 1).split(",");
    var flags = {};
    _.each(opts, function(val, idx) {
        val = val.trim();
        if (val) {
            var parts = val.split("=");
            if (parts.length === 2) {
                var flag = parts[0].trim().toUpperCase();
                var setting = parts[1].trim().toUpperCase();
                flags[flag] = setting;
            }
        }
    });
    return flags;
}

function checkSciNote(value, flags) {
    if (typeof flags.SN !== "undefined") {
        return flags.SN === "T" || flags.SN === "TRUE" || flags.SN === "Y";
    }
    if (ruleSets[curRules].sciNoteByMag) {
        return Math.abs(value) >= snRules.useSNAtOrAbove || Math.abs(value) < snRules.useSNBelow;
    }
    return false;
}

function getSigFigsFromVars(block) {
    var SF = 99;
    var vars = getVarUsage(block);
    _.each(vars, function(val, idx) {
        var cur = curVars.sigDigs[val];
        if (typeof cur !== "undefined" && cur !== "" && cur !== null && cur < SF) {
            SF = cur;
        }
    });
    if (SF !== 99) {
        return SF;
    }
    return -1;
}

function getSNSigFigs(value, flags, block) {
    if (typeof flags.SF !== "undefined") {
        return flags.SF;
    }
    var SF = getSigFigsFromVars(block);
    if (SF !== -1) {
        return SF;
    }
    return snRules.maxSigDigSN;
}

function formatStandard(value, flags, block) {
    if (typeof flags.DP !== "undefined") {
        return mathTools.roundFixed(value, flags.DP);
    }
    if (typeof flags.SF !== "undefined") {
        return mathTools.roundToSigFigs(value, flags.SF);
    }
    if (ruleSets[curRules].useVarsForNonSNSigFigs) {
        var SF = getSigFigsFromVars(block);
        if (SF !== -1) {
            return mathTools.roundToSigFigs(value, SF);
        }
    }
    return useRoundingRules(value);
}

function useRoundingRules(value) {
    if (ruleSets[curRules].nonSNRoundMethod === "DP") {
        return mathTools.round(value, ruleSets[curRules].nonSNRoundCount);
    } else {
        return mathTools.roundToSigFigs(value, ruleSets[curRules].nonSNRoundCount);
    }
}

function formatSciNote(value, flags, block) {
    var sigFigs = getSNSigFigs(value, flags, block);
    var str = sciNoteString(value, sigFigs);
    str = removeE0(str);
    str = fixPositiveExponents(str);
    str = convertEto10(str);
    return str;
}

function sciNoteString(num, sigDig) {
    if (sigDig < 1) {
        sigDig = 1;
    }
    return num.toExponential(sigDig - 1);
}

function removeE0(str) {
    str = str.replace("e+0", "");
    str = str.replace("e-0", "");
    return str;
}

function fixPositiveExponents(str) {
    return str.replace("e+", "e");
}

// Added to convert the toExponential() format (e.g., 1.5e4) to power of 10 format (1.5x10^4, but superscripted)
function convertEto10(str) {
    var parts = str.split('e');
    str = parts[0];
    if (parts.length === 2) {
      //var exp = '<sup>' + parts[1] + '</sup>';
      var exp = '_exp_' + parts[1] + '_scinote_';
      str += '&#215;_scinote_10' + exp;
    }

    return str;
}

function performEval(eqString, varCode) {
    try {
        eval(varCode + "testResult = " + eqString);
        return testResult;
    } catch (err) {
        return 0;
    }
}

function varBlock(string, varCode) {
    var resolved = performEval(stripFlags(string), varCode);
    if (typeof resolved === "undefined") {
        resolved = 1337;
    }
    var flags = getFlags(string);
    var useSciNote = checkSciNote(resolved, flags);
    if (useSciNote) {
        return formatSciNote(resolved, flags, string);
    } else {
        return formatStandard(resolved, flags, string);
    }
}

function testVar(string, varCode) {
    try {
        eval(varCode + "testResult = " + stripFlags(string));
        if (isNaN(testResult) || testResult === undefined) {
            return false;
        }
        return true;
    } catch (err) {
        return false;
    }
}

function replaceVars(string, vars, rules, styleMode) {
    if (!string) {
        return "";
    }
    curVars = vars;
    if (ruleSets[rules]) {
        curRules = rules;
    }
    i = x = y = undefined;
    var setVars = varSelect.varsToCode(curVars);
    return varSub.findAndReplaceVars(string, styleMode, function(string) {
        var cleaned = varSelect.cleanMathString(string);
        var noBrackets = cleaned.substring(1, cleaned.length - 1);
        // Append ',SN=T' to variable name to trigger scientific notation processing.
        if (vars.sciNote[noBrackets]) { noBrackets += ',SN=T'; }
        return varBlock(noBrackets, setVars);
    });
}

exports.replaceVars = replaceVars;

function verifyVars(string, vars, rules) {
    curVars = vars;
    if (ruleSets[rules]) {
        curRules = rules;
    }
    i = x = y = undefined;
    var setVars = varSelect.varsToCode(curVars);
    var allVars = varSub.findAllVarBlocks(string);
    var errMsg = null;
    if (allVars) {
        _.each(allVars, function(val, idx) {
            if (typeof val === "object" && val.err) {
                errMsg = "Illegal MathML";
                return false;
            }
            var fixed = varSelect.cleanMathString(val);
            var noBrackets = fixed.substring(1, fixed.length - 1);
            if (testVar(noBrackets, setVars) === false) {
                errMsg = "Unable to resolve variables";
                return false;
            }
        });
    }
    return errMsg;
}

exports.verifyVars = verifyVars;

exports.testGetVarUsage = getVarUsage;

function testSetCurVars(vars) {
    curVars = vars;
}

exports.testSetCurVars = testSetCurVars;

function testPerformEval(eq, vars) {
    var varCode = varSelect.varsToCode(vars);
    return performEval(eq, varCode);
}

exports.testPerformEval = testPerformEval;
