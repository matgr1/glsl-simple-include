"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var shaderNewLine = "\n";
function processIncludes(readScript, path, entryScriptPath, entryScript, preprocessorDefines, onDependencyLoaded) {
    return __awaiter(this, void 0, void 0, function () {
        var entryFilePath, entryFolderPath, entryFileName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    entryFilePath = path.resolve(entryScriptPath);
                    entryFolderPath = path.dirname(entryFilePath);
                    entryFileName = path.basename(entryFilePath);
                    if (!nullOrUndefined(entryScript)) return [3 /*break*/, 2];
                    return [4 /*yield*/, readShaderScript(entryFilePath, readScript)];
                case 1:
                    entryScript = _a.sent();
                    onDependencyLoaded(entryFilePath);
                    return [3 /*break*/, 3];
                case 2:
                    entryScript = fixLineEndings(entryScript);
                    _a.label = 3;
                case 3: return [4 /*yield*/, processScript({
                        script: entryScript,
                        scriptFilePath: entryFilePath,
                        scriptFolderPath: entryFolderPath,
                        scriptFileName: entryFileName
                    }, readScript, path, preprocessorDefines, onDependencyLoaded)];
                case 4: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.processIncludes = processIncludes;
function processScript(entryScript, readScript, path, preprocessorDefines, onDependencyLoaded) {
    return __awaiter(this, void 0, void 0, function () {
        var versionString, versionRegex, versionMatch, afterVersionIndex, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    versionString = null;
                    versionRegex = /^\s*#version .*$/m;
                    versionMatch = versionRegex.exec(entryScript.script);
                    if (hasValue(versionMatch)) {
                        afterVersionIndex = versionMatch.index + versionMatch[0].length;
                        versionString = versionMatch[0].trim();
                        entryScript.script = entryScript.script.substr(afterVersionIndex);
                    }
                    result = "";
                    result = appendLine(result, versionString);
                    if (hasValue(preprocessorDefines)) {
                        preprocessorDefines.forEach(function (define) {
                            result = appendLine(result, "#define " + define);
                        });
                    }
                    return [4 /*yield*/, buildScript(result, entryScript, readScript, path, onDependencyLoaded)];
                case 1:
                    // build the script
                    result = _a.sent();
                    return [2 /*return*/, result.trim()];
            }
        });
    });
}
function buildScript(result, entryScript, readScript, path, onDependencyLoaded) {
    return __awaiter(this, void 0, void 0, function () {
        var allScripts, processedScripts, ancestors, fullScript;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allScripts = {};
                    processedScripts = {};
                    ancestors = {};
                    return [4 /*yield*/, insertSortedIncludes(entryScript, readScript, path, ancestors, processedScripts, allScripts, onDependencyLoaded)];
                case 1:
                    fullScript = _a.sent();
                    result = appendLine(result, fullScript);
                    return [2 /*return*/, result];
            }
        });
    });
}
function insertSortedIncludes(currentScript, readScript, path, currentScriptAncestors, processedScripts, allScripts, onDependencyLoaded) {
    return __awaiter(this, void 0, void 0, function () {
        var scriptIncludes, result, includeMatchOffset, i, scriptInclude, beforeInclude, afterInclude, includeValue, childAncestors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getScriptIncludes(currentScript, readScript, path, allScripts, onDependencyLoaded)];
                case 1:
                    scriptIncludes = _a.sent();
                    result = currentScript.script;
                    includeMatchOffset = 0;
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < scriptIncludes.length)) return [3 /*break*/, 7];
                    scriptInclude = scriptIncludes[i];
                    if (currentScriptAncestors[scriptInclude.script.scriptFilePath]) {
                        throw new Error("Cycle detected");
                    }
                    if (scriptInclude.script.scriptFilePath === currentScript.scriptFilePath) {
                        throw new Error("Attempt to include self");
                    }
                    beforeInclude = result.substring(0, includeMatchOffset + scriptInclude.includeMatchOffset);
                    afterInclude = result.substring(includeMatchOffset + scriptInclude.includeMatchOffset + scriptInclude.includeMatchLength);
                    includeValue = "";
                    if (!processedScripts[scriptInclude.script.scriptFilePath]) return [3 /*break*/, 3];
                    console.log("Script " + scriptInclude.script.scriptFilePath + " already included");
                    return [3 /*break*/, 5];
                case 3:
                    childAncestors = Object.assign({}, currentScriptAncestors);
                    childAncestors[currentScript.scriptFilePath] = true;
                    return [4 /*yield*/, insertSortedIncludes(scriptInclude.script, readScript, path, childAncestors, processedScripts, allScripts, onDependencyLoaded)];
                case 4:
                    includeValue = _a.sent();
                    includeValue = shaderNewLine + includeValue + shaderNewLine;
                    processedScripts[scriptInclude.script.scriptFilePath] = true;
                    _a.label = 5;
                case 5:
                    result = beforeInclude + includeValue + afterInclude;
                    includeMatchOffset += (includeValue.length - scriptInclude.includeMatchLength);
                    _a.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/, result];
            }
        });
    });
}
function getScriptIncludes(script, readScript, path, allScripts, onDependencyLoaded) {
    return __awaiter(this, void 0, void 0, function () {
        var includes, regex, includeMatch, relativeIncludeFilePath, includeFilePath, includeFolderPath, includeFileName, includeScript, _a, includeInfo;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    includes = [];
                    if (!hasValue(script)) return [3 /*break*/, 4];
                    regex = /^\#pragma include \"(.*)\"$/gm;
                    includeMatch = regex.exec(script.script);
                    _b.label = 1;
                case 1:
                    if (!includeMatch) return [3 /*break*/, 4];
                    relativeIncludeFilePath = includeMatch[1];
                    includeFilePath = path.resolve(script.scriptFolderPath, relativeIncludeFilePath);
                    includeFolderPath = path.dirname(includeFilePath);
                    includeFileName = path.basename(includeFilePath);
                    includeScript = allScripts[includeFilePath];
                    if (!nullOrUndefined(includeScript)) return [3 /*break*/, 3];
                    _a = {};
                    return [4 /*yield*/, readShaderScript(includeFilePath, readScript)];
                case 2:
                    includeScript = (_a.script = _b.sent(),
                        _a.scriptFilePath = includeFilePath,
                        _a.scriptFolderPath = includeFolderPath,
                        _a.scriptFileName = includeFileName,
                        _a);
                    onDependencyLoaded(includeFilePath);
                    allScripts[includeFilePath] = includeScript;
                    _b.label = 3;
                case 3:
                    includeInfo = {
                        script: includeScript,
                        includeMatchOffset: includeMatch.index,
                        includeMatchLength: includeMatch[0].length
                    };
                    includes.push(includeInfo);
                    includeMatch = regex.exec(script.script);
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, includes];
            }
        });
    });
}
function readShaderScript(path, readScript) {
    return __awaiter(this, void 0, void 0, function () {
        var script;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readScript(path)];
                case 1:
                    script = _a.sent();
                    return [2 /*return*/, fixLineEndings(script)];
            }
        });
    });
}
function fixLineEndings(source) {
    return source.replace("\r\n", shaderNewLine);
}
function appendLine(currentValue, lineToAppend) {
    if (nullOrUndefined(lineToAppend)) {
        return currentValue;
    }
    return currentValue + lineToAppend + shaderNewLine;
}
function hasValue(obj) {
    return (false == nullOrUndefined(obj));
}
function nullOrUndefined(obj) {
    return (obj === null) || (obj === undefined);
}
//# sourceMappingURL=glsl-simple-include.js.map