// module.exports = require("ssREbq"); // ch: wtf is this?

var varSelect = require("./var-select.js");

var vtpEval = require("./vtp-eval.js");

exports.chooseVars = varSelect.chooseVars;

exports.replaceVars = vtpEval.replaceVars;

exports.verifyVars = vtpEval.verifyVars;

function parseRules(ruleObj) {
    if (typeof ruleObj !== "undefined") {
        if (ruleObj.math) {
            return "math";
        } else {
            if (ruleObj.physics) {
                return "physics";
            }
        }
    }
}

function evaluate(strings, varList, constraints, avoidSeed, useSeed, rules, styleMode) {
    if (typeof strings !== "object" || typeof strings.length === "undefined" || typeof varList !== "object" || typeof varList.length === "undefined") {
        return null;
    }
    var vtpRules = parseRules(rules);
    var chosen = varSelect.chooseVars(varList, constraints, {
            use: useSeed,
            avoid: avoidSeed
        });
    var out = [];
    for (var i = 0; i < strings.length; i++) {
        try {
          var res = vtpEval.replaceVars(strings[i], chosen, vtpRules, styleMode);
        } catch (e) {
          res = strings[i]; 
        }
        out.push(res);
    }
    return {
        strings: out,
        seed: chosen.seedUsed
    };
}

exports.evaluate = evaluate;
