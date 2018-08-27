// if (typeof window === "undefined" || typeof window._ === "undefined") {
//     var _ = require("./underscore.js");
// } else {
//     _ = window._;
// }

var xmlLib = require("./xml-tools.js");

var useStyleMode = false;

var styleClass;

function safeTrim(text) {
    trimLeft = /^ +/;
    trimRight = / +$/;
    return text.toString().replace(trimLeft, "").replace(trimRight, "");
}

function getPairs(open, close, string) {
    var idx = 0;
    var len = string.length;
    var out = [];
    while (idx < len - 1) {
        var i1 = string.indexOf(open, idx);
        var i2 = string.indexOf(close, idx + 1);
        if (i1 === -1 || i2 === -1) {
            break;
        }
        out.push([ i1, i2 + 1 ]);
        idx = i2 + 1;
    }
    return out;
}

function findVarsHtml(xml, func, params) {
    var hasParens = xmlLib.findContaining(xml, "[");
    _.each(hasParens, function(val, idx) {
        if (!xmlLib.hasAncestor(val, "math")) {
            var pairs = getPairs("[", "]", val.textContent);
            for (var i = pairs.length - 1; i >= 0; i--) {
                func(val, pairs[i][0], pairs[i][1], params);
            }
        }
    });
}

function findVarsMML(xml, func, params) {
    var hasParens = xmlLib.findContaining(xml, "[");
    _.each(hasParens, function(val, idx) {
        val = val.parentNode;
        if (val.tagName === "mtext" || val.tagName === "maction") {
            var text = safeTrim(xmlLib.text(val));
            var left = text.indexOf("[");
            var right = text.indexOf("]", left + 1);
            if (left !== -1 && right !== -1) {
                var err = null;
                if (left !== 0 || right !== text.length - 1) {
                    err = "Brackets found in <mtext>, but they aren't taking up the entire <mtext> block";
                    console.log(err);
                }
                func(val, params, err);
            }
        }
    });
}

function replaceMML(el, callback) {
    var calced = callback(safeTrim(el.textContent));
    xmlLib.setText(el, calced);
    if (el.nodeName === "mtext") {
        el = xmlLib.changeXmlNodeType(el, "mn");
    }
    if (useStyleMode) {
        el.setAttribute("class", styleClass);
    }
}

function replaceHTML(el, start, end, callback) {
    var txt = el.textContent;
    var calced = callback(txt.substring(start, end));
    var node = el;
    if (!useStyleMode) {
        node.textContent = txt.slice(0, start) + calced + txt.slice(end);
    } else {
        var newNode = xmlLib.splitTextNode(el, start, end, "span", styleClass);
        // use innerHTML here to cause calced to be processed as HTML rather than entity-containing text.
        newNode.innerHTML = calced;
    }
}

// Fix issues with answers not displaying correctly in Print Preview.
// When entire scientific notation answer is vtped by the browser, HTML entities
// replace &, <, and >, causing answers to be rendered incorrectly.
function fixMathML(str) {
  str = str.replace(/&amp;#215;/g, '&nbsp;<mo>&#215;</mo>&nbsp;'); // multiplication sign
  str = str.replace(/&lt;/g, '<');
  str = str.replace(/&gt;/g, '>');
  // The <msup> was added because <sup> was breaking in a mathjax (or mathml) context.
  // On the other hand, <msup> appears ineffective in some cases. Ex DrDoom FPP Honors 1 FL 25Aug2017-2, 15.1 Electric Charge
  // Next time this breaks, we'll have to find a solution that works in either context.
  str = str.replace(/10<sup>(-?\d+)<\/sup>/, '_sup_10_exp_$1_sup_'); // scientific notation
  return str;
}

function findAndReplaceVars(string, styleMode, callback) {
    var xml = xmlLib.stringToXML(string);
    if (xml === "fail") {
        return string;
    }
    useStyleMode = !!styleMode;
    styleClass = styleMode;
    findVarsMML(xml, replaceMML, callback);
    findVarsHtml(xml, replaceHTML, callback);
    var str = xmlLib.XMLToString(xml);
    return fixMathML(str);
}

exports.findAndReplaceVars = findAndReplaceVars;

function findAllVarBlocks(string) {
    var xml = xmlLib.stringToXML(string);
    if (xml === "fail") {
        return string;
    }
    styleMode = false;
    var blocks = [];
    findVarsMML(xml, function(el, params, err) {
        if (!err) {
            blocks.push(el.textContent);
        } else {
            blocks.push({
                err: true,
                msg: err
            });
        }
    });
    findVarsHtml(xml, function(el, start, end) {
        blocks.push(el.textContent.substring(start, end));
    });
    return blocks;
}

exports.findAllVarBlocks = findAllVarBlocks;
