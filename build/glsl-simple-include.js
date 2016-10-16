"use strict";
var lodash_1 = require("lodash");
var stripBom = require("strip-bom");
var shaderNewLine = "\n";
function processFile(entryPath, readScript, path, preprocessorDefines) {
    var entryFilePath = path.resolve(entryPath);
    var entryFolderPath = path.dirname(entryFilePath);
    var entryFileName = path.basename(entryFilePath);
    var entryScript = readShaderScript(entryFilePath, readScript);
    return processScript({
        script: entryScript,
        scriptFilePath: entryFilePath,
        scriptFolderPath: entryFolderPath,
        scriptFileName: entryFileName
    }, readScript, path, preprocessorDefines);
}
exports.processFile = processFile;
function processScript(entryScript, readScript, path, preprocessorDefines) {
    // strip version
    var versionString = null;
    var versionRegex = /^\s*#version .*$/m;
    var versionMatch = versionRegex.exec(entryScript.script);
    if ((null !== versionMatch) && (undefined !== versionMatch)) {
        var afterVersionIndex = versionMatch.index + versionMatch[0].length;
        versionString = versionMatch[0].trim();
        entryScript.script = entryScript.script.substr(afterVersionIndex);
    }
    // append version and preprocessor macros
    var result = "";
    result = appendLine(result, versionString);
    if ((null !== preprocessorDefines) && (undefined !== preprocessorDefines)) {
        preprocessorDefines.forEach(function (define) {
            result = appendLine(result, "#define " + define);
        });
    }
    // build the script
    result = buildScript(result, entryScript, readScript, path);
    return stripBom(result).trim();
}
exports.processScript = processScript;
// TODO: typings for StringBuilder
function buildScript(result, entryScript, readScript, path) {
    var allScripts = {};
    var processedScripts = {};
    var ancestors = {};
    var fullScript = insertSortedIncludes(entryScript, readScript, path, ancestors, processedScripts, allScripts);
    result = appendLine(result, fullScript);
    return result;
}
function insertSortedIncludes(currentScript, readScript, path, currentScriptAncestors, processedScripts, allScripts) {
    var scriptIncludes = getScriptIncludes(currentScript, readScript, path, allScripts);
    var result = currentScript.script;
    var includeMatchOffset = 0;
    for (var i = 0; i < scriptIncludes.length; i++) {
        var scriptInclude = scriptIncludes[i];
        if (currentScriptAncestors[scriptInclude.script.scriptFilePath]) {
            throw new Error("Cycle detected");
        }
        if (scriptInclude.script.scriptFilePath === currentScript.scriptFilePath) {
            throw new Error("Attempt to include self");
        }
        var beforeInclude = result.substring(0, includeMatchOffset + scriptInclude.includeMatchOffset);
        var afterInclude = result.substring(includeMatchOffset + scriptInclude.includeMatchOffset + scriptInclude.includeMatchLength);
        var includeValue = "";
        if (processedScripts[scriptInclude.script.scriptFilePath]) {
            console.log("Script " + scriptInclude.script.scriptFilePath + " already included");
        }
        else {
            var childAncestors = lodash_1.assign({}, currentScriptAncestors);
            childAncestors[currentScript.scriptFilePath] = true;
            includeValue = insertSortedIncludes(scriptInclude.script, readScript, path, childAncestors, processedScripts, allScripts);
            includeValue = shaderNewLine + includeValue + shaderNewLine;
            processedScripts[scriptInclude.script.scriptFilePath] = true;
        }
        result = beforeInclude + includeValue + afterInclude;
        includeMatchOffset += (includeValue.length - scriptInclude.includeMatchLength);
    }
    return result;
}
function getScriptIncludes(script, readScript, path, allScripts) {
    var includes = [];
    if ((null !== script) && (undefined !== script)) {
        var regex = /^\#pragma include \"(.*)\"$/gm;
        var includeMatch = regex.exec(script.script);
        while (includeMatch) {
            var relativeIncludeFilePath = includeMatch[1];
            var includeFilePath = path.resolve(script.scriptFolderPath, relativeIncludeFilePath);
            var includeFolderPath = path.dirname(includeFilePath);
            var includeFileName = path.basename(includeFilePath);
            var includeScript = allScripts[includeFilePath];
            if ((null === includeScript) || (undefined === includeScript)) {
                includeScript =
                    {
                        script: readShaderScript(includeFilePath, readScript),
                        scriptFilePath: includeFilePath,
                        scriptFolderPath: includeFolderPath,
                        scriptFileName: includeFileName
                    };
                allScripts[includeFilePath] = includeScript;
            }
            var includeInfo = {
                script: includeScript,
                includeMatchOffset: includeMatch.index,
                includeMatchLength: includeMatch[0].length
            };
            includes.push(includeInfo);
            includeMatch = regex.exec(script.script);
        }
    }
    return includes;
}
function readShaderScript(path, readScript) {
    var script = readScript(path);
    return fixLineEndings(script);
}
function fixLineEndings(source) {
    return source.replace("\r\n", shaderNewLine);
}
function appendLine(value, newLine) {
    if ((null === newLine) || (undefined === newLine)) {
        return value;
    }
    return value + newLine + shaderNewLine;
}
//# sourceMappingURL=glsl-simple-include.js.map