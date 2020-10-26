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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
Object.defineProperty(exports, "__esModule", { value: true });
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
                    if (!(i < scriptIncludes.length)) return [3 /*break*/, 6];
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
                    if (!!processedScripts[scriptInclude.script.scriptFilePath]) return [3 /*break*/, 4];
                    childAncestors = Object.assign({}, currentScriptAncestors);
                    childAncestors[currentScript.scriptFilePath] = true;
                    return [4 /*yield*/, insertSortedIncludes(scriptInclude.script, readScript, path, childAncestors, processedScripts, allScripts, onDependencyLoaded)];
                case 3:
                    includeValue = _a.sent();
                    includeValue = shaderNewLine + includeValue + shaderNewLine;
                    processedScripts[scriptInclude.script.scriptFilePath] = true;
                    _a.label = 4;
                case 4:
                    result = beforeInclude + includeValue + afterInclude;
                    includeMatchOffset += (includeValue.length - scriptInclude.includeMatchLength);
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 2];
                case 6: return [2 /*return*/, result];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xzbC1zaW1wbGUtaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9nbHNsLXNpbXBsZS1pbmNsdWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFTQSxJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFFM0IseUJBQ0MsVUFBc0IsRUFDdEIsSUFBVSxFQUNWLGVBQXVCLEVBQ3ZCLFdBQW9CLEVBQ3BCLG1CQUE4QixFQUM5QixrQkFBcUQ7Ozs7OztvQkFFakQsYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQzlDLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUM5QyxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQzt5QkFFN0MsZUFBZSxDQUFDLFdBQVcsQ0FBQyxFQUE1Qix3QkFBNEI7b0JBRWpCLHFCQUFNLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsRUFBQTs7b0JBQS9ELFdBQVcsR0FBRyxTQUFpRCxDQUFDO29CQUNoRSxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7O29CQUlsQyxXQUFXLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzt3QkFHcEMscUJBQU0sYUFBYSxDQUN6Qjt3QkFDQyxNQUFNLEVBQUUsV0FBVzt3QkFDbkIsY0FBYyxFQUFFLGFBQWE7d0JBQzdCLGdCQUFnQixFQUFFLGVBQWU7d0JBQ2pDLGNBQWMsRUFBRSxhQUFhO3FCQUM3QixFQUNELFVBQVUsRUFDVixJQUFJLEVBQ0osbUJBQW1CLEVBQ25CLGtCQUFrQixDQUFDLEVBQUE7d0JBVnBCLHNCQUFPLFNBVWEsRUFBQzs7OztDQUNyQjtBQWpDRCwwQ0FpQ0M7QUFVRCx1QkFDQyxXQUF1QixFQUN2QixVQUFzQixFQUN0QixJQUFVLEVBQ1YsbUJB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TSxDQUFDLENBQUM7O3dCQUkzQyxzQkFBTyxRQUFRLEVBQUM7Ozs7Q0FDaEI7QUFFRCwwQkFBZ0MsSUFBWSxFQUFFLFVBQXNCOzs7Ozt3QkFFdEQscUJBQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFBOztvQkFBL0IsTUFBTSxHQUFHLFNBQXNCO29CQUNuQyxzQkFBTyxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUM7Ozs7Q0FDOUI7QUFFRCx3QkFBd0IsTUFBYztJQUVyQyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFFRCxvQkFBb0IsWUFBb0IsRUFBRSxZQUFvQjtJQUU3RCxJQUFJLGVBQWUsQ0FBQyxZQUFZLENBQUMsRUFDakM7UUFDQyxPQUFPLFlBQVksQ0FBQztLQUNwQjtJQUVELE9BQU8sWUFBWSxHQUFHLFlBQVksR0FBRyxhQUFhLENBQUM7QUFDcEQsQ0FBQztBQUVELGtCQUFrQixHQUFRO0lBRXpCLE9BQU8sQ0FBQyxLQUFLLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUVELHlCQUF5QixHQUFRO0lBRWhDLE9BQU8sQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssU0FBUyxDQUFDLENBQUM7QUFDOUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIHJlYWRTY3JpcHQgPSAocGF0aDogc3RyaW5nKSA9PiBQcm9taXNlPHN0cmluZz47XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIHBhdGhcclxue1xyXG5cdHJlc29sdmUoLi4ucGF0aDogc3RyaW5nW10pOiBzdHJpbmc7XHJcblx0ZGlybmFtZShwYXRoOiBzdHJpbmcpOiBzdHJpbmc7XHJcblx0YmFzZW5hbWUocGF0aDogc3RyaW5nLCBleHQ/OiBzdHJpbmcpOiBzdHJpbmc7XHJcbn1cclxuXHJcbmNvbnN0IHNoYWRlck5ld0xpbmUgPSBcIlxcblwiO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NJbmNsdWRlcyhcclxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxyXG5cdHBhdGg6IHBhdGgsXHJcblx0ZW50cnlTY3JpcHRQYXRoOiBzdHJpbmcsXHJcblx0ZW50cnlTY3JpcHQ/OiBzdHJpbmcsXHJcblx0cHJlcHJvY2Vzc29yRGVmaW5lcz86IHN0cmluZ1tdLFxyXG5cdG9uRGVwZW5kZW5jeUxvYWRlZD86IChkZXBlbmRlbmN5UGF0aDogc3RyaW5nKSA9PiB2b2lkKTogUHJvbWlzZTxzdHJpbmc+XHJcbntcclxuXHRsZXQgZW50cnlGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShlbnRyeVNjcmlwdFBhdGgpO1xyXG5cdGxldCBlbnRyeUZvbGRlclBhdGggPSBwYXRoLmRpcm5hbWUoZW50cnlGaWxlUGF0aCk7XHJcblx0bGV0IGVudHJ5RmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGVudHJ5RmlsZVBhdGgpO1xyXG5cclxuXHRpZiAobnVsbE9yVW5kZWZpbmVkKGVudHJ5U2NyaXB0KSlcclxuXHR7XHJcblx0XHRlbnRyeVNjcmlwdCA9IGF3YWl0IHJlYWRTaGFkZXJTY3JpcHQoZW50cnlGaWxlUGF0aCwgcmVhZFNjcmlwdCk7XHJcblx0XHRvbkRlcGVuZGVuY3lMb2FkZWQoZW50cnlGaWxlUGF0aCk7XHJcblx0fVxyXG5cdGVsc2VcclxuXHR7XHJcblx0XHRlbnRyeVNjcmlwdCA9IGZpeExpbmVFbmRpbmdzKGVudHJ5U2NyaXB0KTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBhd2FpdCBwcm9jZXNzU2NyaXB0KFxyXG5cdFx0e1xyXG5cdFx0XHRzY3JpcHQ6IGVudHJ5U2NyaXB0LFxyXG5cdFx0XHRzY3JpcHRGaWxlUGF0aDogZW50cnlGaWxlUGF0aCxcclxuXHRcdFx0c2NyaXB0Rm9sZGVyUGF0aDogZW50cnlGb2xkZXJQYXRoLFxyXG5cdFx0XHRzY3JpcHRGaWxlTmFtZTogZW50cnlGaWxlTmFtZVxyXG5cdFx0fSxcclxuXHRcdHJlYWRTY3JpcHQsXHJcblx0XHRwYXRoLFxyXG5cdFx0cHJlcHJvY2Vzc29yRGVmaW5lcyxcclxuXHRcdG9uRGVwZW5kZW5jeUxvYWRlZCk7XHJcbn1cclxuXHJcbmludGVyZmFjZSBTY3JpcHRJbmZvXHJcbntcclxuXHRzY3JpcHQ6IHN0cmluZztcclxuXHRzY3JpcHRGaWxlUGF0aDogc3RyaW5nO1xyXG5cdHNjcmlwdEZvbGRlclBhdGg6IHN0cmluZztcclxuXHRzY3JpcHRGaWxlTmFtZTogc3RyaW5nO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzU2NyaXB0KFxyXG5cdGVudHJ5U2NyaXB0OiBTY3JpcHRJbmZvLFxyXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXHJcblx0cGF0aDogcGF0aCxcclxuXHRwcmVwcm9jZXNzb3JEZWZpbmVzOiBzdHJpbmdbXSxcclxuXHRvbkRlcGVuZGVuY3lMb2FkZWQ6IChkZXBlbmRlbmN5UGF0aDogc3RyaW5nKSA9PiB2b2lkKTogUHJvbWlzZTxzdHJpbmc+XHJcbntcclxuXHQvLyBzdHJpcCB2ZXJzaW9uXHJcblx0bGV0IHZlcnNpb25TdHJpbmc6IHN0cmluZyA9IG51bGw7XHJcblxyXG5cdGxldCB2ZXJzaW9uUmVnZXggPSAvXlxccyojdmVyc2lvbiAuKiQvbTtcclxuXHRsZXQgdmVyc2lvbk1hdGNoID0gdmVyc2lvblJlZ2V4LmV4ZWMoZW50cnlTY3JpcHQuc2NyaXB0KTtcclxuXHJcblx0aWYgKGhhc1ZhbHVlKHZlcnNpb25NYXRjaCkpXHJcblx0e1xyXG5cdFx0bGV0IGFmdGVyVmVyc2lvbkluZGV4ID0gdmVyc2lvbk1hdGNoLmluZGV4ICsgdmVyc2lvbk1hdGNoWzBdLmxlbmd0aDtcclxuXHJcblx0XHR2ZXJzaW9uU3RyaW5nID0gdmVyc2lvbk1hdGNoWzBdLnRyaW0oKTtcclxuXHRcdGVudHJ5U2NyaXB0LnNjcmlwdCA9IGVudHJ5U2NyaXB0LnNjcmlwdC5zdWJzdHIoYWZ0ZXJWZXJzaW9uSW5kZXgpO1xyXG5cdH1cclxuXHJcblx0Ly8gYXBwZW5kIHZlcnNpb24gYW5kIHByZXByb2Nlc3NvciBtYWNyb3NcclxuXHRsZXQgcmVzdWx0ID0gXCJcIjtcclxuXHRyZXN1bHQgPSBhcHBlbmRMaW5lKHJlc3VsdCwgdmVyc2lvblN0cmluZyk7XHJcblxyXG5cdGlmIChoYXNWYWx1ZShwcmVwcm9jZXNzb3JEZWZpbmVzKSlcclxuXHR7XHJcblx0XHRwcmVwcm9jZXNzb3JEZWZpbmVzLmZvckVhY2goXHJcblx0XHRcdGZ1bmN0aW9uIChkZWZpbmUpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZXN1bHQgPSBhcHBlbmRMaW5lKHJlc3VsdCwgYCNkZWZpbmUgJHtkZWZpbmV9YCk7XHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gYnVpbGQgdGhlIHNjcmlwdFxyXG5cdHJlc3VsdCA9IGF3YWl0IGJ1aWxkU2NyaXB0KHJlc3VsdCwgZW50cnlTY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgsIG9uRGVwZW5kZW5jeUxvYWRlZCk7XHJcblxyXG5cdHJldHVybiByZXN1bHQudHJpbSgpO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU2NyaXB0TWFwXHJcbntcclxuXHRbc2NyaXB0RmlsZVBhdGg6IHN0cmluZ106IFNjcmlwdEluZm9cclxufVxyXG5pbnRlcmZhY2UgUHJvY2Vzc2VkU2NyaXB0TWFwXHJcbntcclxuXHRbc2NyaXB0RmlsZVBhdGg6IHN0cmluZ106IGJvb2xlYW5cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gYnVpbGRTY3JpcHQoXHJcblx0cmVzdWx0OiBzdHJpbmcsXHJcblx0ZW50cnlTY3JpcHQ6IFNjcmlwdEluZm8sXHJcblx0cmVhZFNjcmlwdDogcmVhZFNjcmlwdCxcclxuXHRwYXRoOiBwYXRoLFxyXG5cdG9uRGVwZW5kZW5jeUxvYWRlZDogKGRlcGVuZGVuY3lQYXRoOiBzdHJpbmcpID0+IHZvaWQpOiBQcm9taXNlPHN0cmluZz5cclxue1xyXG5cdGxldCBhbGxTY3JpcHRzOiBTY3JpcHRNYXAgPSB7fTtcclxuXHRsZXQgcHJvY2Vzc2VkU2NyaXB0czogUHJvY2Vzc2VkU2NyaXB0TWFwID0ge307XHJcblx0bGV0IGFuY2VzdG9yczogUHJvY2Vzc2VkU2NyaXB0TWFwID0ge307XHJcblxyXG5cdGxldCBmdWxsU2NyaXB0ID0gYXdhaXQgaW5zZXJ0U29ydGVkSW5jbHVkZXMoZW50cnlTY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgsIGFuY2VzdG9ycywgcHJvY2Vzc2VkU2NyaXB0cywgYWxsU2NyaXB0cywgb25EZXBlbmRlbmN5TG9hZGVkKTtcclxuXHJcblx0cmVzdWx0ID0gYXBwZW5kTGluZShyZXN1bHQsIGZ1bGxTY3JpcHQpO1xyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBpbnNlcnRTb3J0ZWRJbmNsdWRlcyhcclxuXHRjdXJyZW50U2NyaXB0OiBTY3JpcHRJbmZvLFxyXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXHJcblx0cGF0aDogcGF0aCxcclxuXHRjdXJyZW50U2NyaXB0QW5jZXN0b3JzOiBQcm9jZXNzZWRTY3JpcHRNYXAsXHJcblx0cHJvY2Vzc2VkU2NyaXB0czogUHJvY2Vzc2VkU2NyaXB0TWFwLFxyXG5cdGFsbFNjcmlwdHM6IFNjcmlwdE1hcCxcclxuXHRvbkRlcGVuZGVuY3lMb2FkZWQ6IChkZXBlbmRlbmN5UGF0aDogc3RyaW5nKSA9PiB2b2lkKTogUHJvbWlzZTxzdHJpbmc+XHJcbntcclxuXHRsZXQgc2NyaXB0SW5jbHVkZXMgPSBhd2FpdCBnZXRTY3JpcHRJbmNsdWRlcyhjdXJyZW50U2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoLCBhbGxTY3JpcHRzLCBvbkRlcGVuZGVuY3lMb2FkZWQpO1xyXG5cclxuXHRsZXQgcmVzdWx0ID0gY3VycmVudFNjcmlwdC5zY3JpcHQ7XHJcblxyXG5cdGxldCBpbmNsdWRlTWF0Y2hPZmZzZXQgPSAwO1xyXG5cclxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHNjcmlwdEluY2x1ZGVzLmxlbmd0aDsgaSsrKVxyXG5cdHtcclxuXHRcdGxldCBzY3JpcHRJbmNsdWRlID0gc2NyaXB0SW5jbHVkZXNbaV07XHJcblxyXG5cdFx0aWYgKGN1cnJlbnRTY3JpcHRBbmNlc3RvcnNbc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGhdKVxyXG5cdFx0e1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDeWNsZSBkZXRlY3RlZFwiKTtcclxuXHRcdH1cclxuXHRcdGlmIChzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aCA9PT0gY3VycmVudFNjcmlwdC5zY3JpcHRGaWxlUGF0aClcclxuXHRcdHtcclxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQXR0ZW1wdCB0byBpbmNsdWRlIHNlbGZcIik7XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGJlZm9yZUluY2x1ZGUgPSByZXN1bHQuc3Vic3RyaW5nKDAsIGluY2x1ZGVNYXRjaE9mZnNldCArIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoT2Zmc2V0KTtcclxuXHRcdGxldCBhZnRlckluY2x1ZGUgPSByZXN1bHQuc3Vic3RyaW5nKGluY2x1ZGVNYXRjaE9mZnNldCArIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoT2Zmc2V0ICsgc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hMZW5ndGgpO1xyXG5cclxuXHRcdGxldCBpbmNsdWRlVmFsdWU6IHN0cmluZyA9IFwiXCI7XHJcblxyXG5cdFx0aWYgKCFwcm9jZXNzZWRTY3JpcHRzW3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoXSlcclxuXHRcdHtcclxuXHRcdFx0bGV0IGNoaWxkQW5jZXN0b3JzID0gT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFNjcmlwdEFuY2VzdG9ycyk7XHJcblx0XHRcdGNoaWxkQW5jZXN0b3JzW2N1cnJlbnRTY3JpcHQuc2NyaXB0RmlsZVBhdGhdID0gdHJ1ZTtcclxuXHJcblx0XHRcdGluY2x1ZGVWYWx1ZSA9IGF3YWl0IGluc2VydFNvcnRlZEluY2x1ZGVzKHNjcmlwdEluY2x1ZGUuc2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoLCBjaGlsZEFuY2VzdG9ycywgcHJvY2Vzc2VkU2NyaXB0cywgYWxsU2NyaXB0cywgb25EZXBlbmRlbmN5TG9hZGVkKTtcclxuXHRcdFx0aW5jbHVkZVZhbHVlID0gc2hhZGVyTmV3TGluZSArIGluY2x1ZGVWYWx1ZSArIHNoYWRlck5ld0xpbmU7XHJcblxyXG5cdFx0XHRwcm9jZXNzZWRTY3JpcHRzW3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoXSA9IHRydWVcclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQgPSBiZWZvcmVJbmNsdWRlICsgaW5jbHVkZVZhbHVlICsgYWZ0ZXJJbmNsdWRlO1xyXG5cdFx0aW5jbHVkZU1hdGNoT2Zmc2V0ICs9IChpbmNsdWRlVmFsdWUubGVuZ3RoIC0gc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hMZW5ndGgpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuaW50ZXJmYWNlIEluY2x1ZGVJbmZvXHJcbntcclxuXHRzY3JpcHQ6IFNjcmlwdEluZm87XHJcblx0aW5jbHVkZU1hdGNoT2Zmc2V0OiBudW1iZXI7XHJcblx0aW5jbHVkZU1hdGNoTGVuZ3RoOiBudW1iZXI7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNjcmlwdEluY2x1ZGVzKFxyXG5cdHNjcmlwdDogU2NyaXB0SW5mbyxcclxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxyXG5cdHBhdGg6IHBhdGgsXHJcblx0YWxsU2NyaXB0czogU2NyaXB0TWFwLFxyXG5cdG9uRGVwZW5kZW5jeUxvYWRlZDogKGRlcGVuZGVuY3lQYXRoOiBzdHJpbmcpID0+IHZvaWQpOiBQcm9taXNlPEluY2x1ZGVJbmZvW10+XHJcbntcclxuXHRsZXQgaW5jbHVkZXM6IEluY2x1ZGVJbmZvW10gPSBbXTtcclxuXHJcblx0aWYgKGhhc1ZhbHVlKHNjcmlwdCkpXHJcblx0e1xyXG5cdFx0bGV0IHJlZ2V4ID0gL15cXCNwcmFnbWEgaW5jbHVkZSBcXFwiKC4qKVxcXCIkL2dtO1xyXG5cclxuXHRcdGxldCBpbmNsdWRlTWF0Y2ggPSByZWdleC5leGVjKHNjcmlwdC5zY3JpcHQpO1xyXG5cclxuXHRcdHdoaWxlIChpbmNsdWRlTWF0Y2gpXHJcblx0XHR7XHJcblx0XHRcdGxldCByZWxhdGl2ZUluY2x1ZGVGaWxlUGF0aCA9IGluY2x1ZGVNYXRjaFsxXTtcclxuXHJcblx0XHRcdGxldCBpbmNsdWRlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoc2NyaXB0LnNjcmlwdEZvbGRlclBhdGgsIHJlbGF0aXZlSW5jbHVkZUZpbGVQYXRoKTtcclxuXHRcdFx0bGV0IGluY2x1ZGVGb2xkZXJQYXRoID0gcGF0aC5kaXJuYW1lKGluY2x1ZGVGaWxlUGF0aCk7XHJcblx0XHRcdGxldCBpbmNsdWRlRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGluY2x1ZGVGaWxlUGF0aCk7XHJcblxyXG5cdFx0XHRsZXQgaW5jbHVkZVNjcmlwdCA9IGFsbFNjcmlwdHNbaW5jbHVkZUZpbGVQYXRoXTtcclxuXHJcblx0XHRcdGlmIChudWxsT3JVbmRlZmluZWQoaW5jbHVkZVNjcmlwdCkpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRpbmNsdWRlU2NyaXB0ID1cclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0c2NyaXB0OiBhd2FpdCByZWFkU2hhZGVyU2NyaXB0KGluY2x1ZGVGaWxlUGF0aCwgcmVhZFNjcmlwdCksXHJcblx0XHRcdFx0XHRcdHNjcmlwdEZpbGVQYXRoOiBpbmNsdWRlRmlsZVBhdGgsXHJcblx0XHRcdFx0XHRcdHNjcmlwdEZvbGRlclBhdGg6IGluY2x1ZGVGb2xkZXJQYXRoLFxyXG5cdFx0XHRcdFx0XHRzY3JpcHRGaWxlTmFtZTogaW5jbHVkZUZpbGVOYW1lXHJcblx0XHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHRvbkRlcGVuZGVuY3lMb2FkZWQoaW5jbHVkZUZpbGVQYXRoKTtcclxuXHJcblx0XHRcdFx0YWxsU2NyaXB0c1tpbmNsdWRlRmlsZVBhdGhdID0gaW5jbHVkZVNjcmlwdDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0IGluY2x1ZGVJbmZvOiBJbmNsdWRlSW5mbyA9XHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0c2NyaXB0OiBpbmNsdWRlU2NyaXB0LFxyXG5cdFx0XHRcdFx0aW5jbHVkZU1hdGNoT2Zmc2V0OiBpbmNsdWRlTWF0Y2guaW5kZXgsXHJcblx0XHRcdFx0XHRpbmNsdWRlTWF0Y2hMZW5ndGg6IGluY2x1ZGVNYXRjaFswXS5sZW5ndGhcclxuXHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0aW5jbHVkZXMucHVzaChpbmNsdWRlSW5mbyk7XHJcblxyXG5cdFx0XHRpbmNsdWRlTWF0Y2ggPSByZWdleC5leGVjKHNjcmlwdC5zY3JpcHQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIGluY2x1ZGVzO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiByZWFkU2hhZGVyU2NyaXB0KHBhdGg6IHN0cmluZywgcmVhZFNjcmlwdDogcmVhZFNjcmlwdCk6IFByb21pc2U8c3RyaW5nPlxyXG57XHJcblx0bGV0IHNjcmlwdCA9IGF3YWl0IHJlYWRTY3JpcHQocGF0aCk7XHJcblx0cmV0dXJuIGZpeExpbmVFbmRpbmdzKHNjcmlwdCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZpeExpbmVFbmRpbmdzKHNvdXJjZTogc3RyaW5nKVxyXG57XHJcblx0cmV0dXJuIHNvdXJjZS5yZXBsYWNlKFwiXFxyXFxuXCIsIHNoYWRlck5ld0xpbmUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBlbmRMaW5lKGN1cnJlbnRWYWx1ZTogc3RyaW5nLCBsaW5lVG9BcHBlbmQ6IHN0cmluZyk6IHN0cmluZ1xyXG57XHJcblx0aWYgKG51bGxPclVuZGVmaW5lZChsaW5lVG9BcHBlbmQpKVxyXG5cdHtcclxuXHRcdHJldHVybiBjdXJyZW50VmFsdWU7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gY3VycmVudFZhbHVlICsgbGluZVRvQXBwZW5kICsgc2hhZGVyTmV3TGluZTtcclxufVxyXG5cclxuZnVuY3Rpb24gaGFzVmFsdWUob2JqOiBhbnkpOiBib29sZWFuXHJcbntcclxuXHRyZXR1cm4gKGZhbHNlID09IG51bGxPclVuZGVmaW5lZChvYmopKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbnVsbE9yVW5kZWZpbmVkKG9iajogYW55KTogYm9vbGVhblxyXG57XHJcblx0cmV0dXJuIChvYmogPT09IG51bGwpIHx8IChvYmogPT09IHVuZGVmaW5lZCk7XHJcbn1cclxuIl19