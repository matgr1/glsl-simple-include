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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xzbC1zaW1wbGUtaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9nbHNsLXNpbXBsZS1pbmNsdWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVNBLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQztBQUUzQix5QkFDQyxVQUFzQixFQUN0QixJQUFVLEVBQ1YsZUFBdUIsRUFDdkIsV0FBb0IsRUFDcEIsbUJBQThCLEVBQzlCLGtCQUFxRDs7WUFFakQsYUFBYSxFQUNiLGVBQWUsRUFDZixhQUFhOzs7O29DQUZHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDO3NDQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztvQ0FDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7eUJBRTVDLGVBQWUsQ0FBQyxXQUFXLENBQUMsRUFBNUIsd0JBQTRCO29CQUVqQixxQkFBTSxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLEVBQUE7O29CQUEvRCxXQUFXLEdBQUcsU0FBaUQsQ0FBQztvQkFDaEUsa0JBQWtCLENBQUMsYUFBYSxDQUFDLENBQUM7OztvQkFJbEMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7d0JBR3BDLHFCQUFNLGFBQWEsQ0FDekI7d0JBQ0MsTUFBTSxFQUFFLFdBQVc7d0JBQ25CLGNBQWMsRUFBRSxhQUFhO3dCQUM3QixnQkFBZ0IsRUFBRSxlQUFlO3dCQUNqQyxjQUFjLEVBQUUsYUFBYTtxQkFDN0IsRUFDRCxVQUFVLEVBQ1YsSUFBSSxFQUNKLG1CQUFtQixFQUNuQixrQkFBa0IsQ0FBQyxFQUFBO3dCQVZwQixzQkFBTyxTQVVhLEVBQUM7Ozs7Q0FDckI7QUFqQ0QsMENBaUNDO0FBVUQsdUJBQ0MsV0FBdUIsRUFDdkIsVUFBc0IsRUFDdEIsSUFBVSxFQUNWLG1CQUE2QixFQUM3QixrQkFBb0Q7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TUFBTSxDQUFDLENBQUM7O3dCQUkzQyxzQkFBTyxRQUFRLEVBQUM7Ozs7Q0FDaEI7QUFFRCwwQkFBZ0MsSUFBWSxFQUFFLFVBQXNCOzs7Ozt3QkFFdEQscUJBQU0sVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFBOzs2QkFBdEIsU0FBc0I7b0JBQ25DLHNCQUFPLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBQzs7OztDQUM5QjtBQUVELHdCQUF3QixNQUFjO0lBRXJDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBRUQsb0JBQW9CLFlBQW9CLEVBQUUsWUFBb0I7SUFFN0QsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQ2xDLENBQUM7UUFDQSxNQUFNLENBQUMsWUFBWSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxNQUFNLENBQUMsWUFBWSxHQUFHLFlBQVksR0FBRyxhQUFhLENBQUM7QUFDcEQsQ0FBQztBQUVELGtCQUFrQixHQUFRO0lBRXpCLE1BQU0sQ0FBQyxDQUFDLEtBQUssSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBRUQseUJBQXlCLEdBQVE7SUFFaEMsTUFBTSxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLFNBQVMsQ0FBQyxDQUFDO0FBQzlDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgdHlwZSByZWFkU2NyaXB0ID0gKHBhdGg6IHN0cmluZykgPT4gUHJvbWlzZTxzdHJpbmc+O1xuXG5leHBvcnQgaW50ZXJmYWNlIHBhdGhcbntcblx0cmVzb2x2ZSguLi5wYXRoOiBzdHJpbmdbXSk6IHN0cmluZztcblx0ZGlybmFtZShwYXRoOiBzdHJpbmcpOiBzdHJpbmc7XG5cdGJhc2VuYW1lKHBhdGg6IHN0cmluZywgZXh0Pzogc3RyaW5nKTogc3RyaW5nO1xufVxuXG5jb25zdCBzaGFkZXJOZXdMaW5lID0gXCJcXG5cIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NJbmNsdWRlcyhcblx0cmVhZFNjcmlwdDogcmVhZFNjcmlwdCxcblx0cGF0aDogcGF0aCxcblx0ZW50cnlTY3JpcHRQYXRoOiBzdHJpbmcsXG5cdGVudHJ5U2NyaXB0Pzogc3RyaW5nLFxuXHRwcmVwcm9jZXNzb3JEZWZpbmVzPzogc3RyaW5nW10sXG5cdG9uRGVwZW5kZW5jeUxvYWRlZD86IChkZXBlbmRlbmN5UGF0aDogc3RyaW5nKSA9PiB2b2lkKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBlbnRyeUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGVudHJ5U2NyaXB0UGF0aCk7XG5cdGxldCBlbnRyeUZvbGRlclBhdGggPSBwYXRoLmRpcm5hbWUoZW50cnlGaWxlUGF0aCk7XG5cdGxldCBlbnRyeUZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShlbnRyeUZpbGVQYXRoKTtcblxuXHRpZiAobnVsbE9yVW5kZWZpbmVkKGVudHJ5U2NyaXB0KSlcblx0e1xuXHRcdGVudHJ5U2NyaXB0ID0gYXdhaXQgcmVhZFNoYWRlclNjcmlwdChlbnRyeUZpbGVQYXRoLCByZWFkU2NyaXB0KTtcblx0XHRvbkRlcGVuZGVuY3lMb2FkZWQoZW50cnlGaWxlUGF0aCk7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0ZW50cnlTY3JpcHQgPSBmaXhMaW5lRW5kaW5ncyhlbnRyeVNjcmlwdCk7XG5cdH1cblxuXHRyZXR1cm4gYXdhaXQgcHJvY2Vzc1NjcmlwdChcblx0XHR7XG5cdFx0XHRzY3JpcHQ6IGVudHJ5U2NyaXB0LFxuXHRcdFx0c2NyaXB0RmlsZVBhdGg6IGVudHJ5RmlsZVBhdGgsXG5cdFx0XHRzY3JpcHRGb2xkZXJQYXRoOiBlbnRyeUZvbGRlclBhdGgsXG5cdFx0XHRzY3JpcHRGaWxlTmFtZTogZW50cnlGaWxlTmFtZVxuXHRcdH0sXG5cdFx0cmVhZFNjcmlwdCxcblx0XHRwYXRoLFxuXHRcdHByZXByb2Nlc3NvckRlZmluZXMsXG5cdFx0b25EZXBlbmRlbmN5TG9hZGVkKTtcbn1cblxuaW50ZXJmYWNlIFNjcmlwdEluZm9cbntcblx0c2NyaXB0OiBzdHJpbmc7XG5cdHNjcmlwdEZpbGVQYXRoOiBzdHJpbmc7XG5cdHNjcmlwdEZvbGRlclBhdGg6IHN0cmluZztcblx0c2NyaXB0RmlsZU5hbWU6IHN0cmluZztcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc1NjcmlwdChcblx0ZW50cnlTY3JpcHQ6IFNjcmlwdEluZm8sXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXG5cdHBhdGg6IHBhdGgsXG5cdHByZXByb2Nlc3NvckRlZmluZXM6IHN0cmluZ1tdLFxuXHRvbkRlcGVuZGVuY3lMb2FkZWQ6IChkZXBlbmRlbmN5UGF0aDogc3RyaW5nKSA9PiB2b2lkKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdC8vIHN0cmlwIHZlcnNpb25cblx0bGV0IHZlcnNpb25TdHJpbmc6IHN0cmluZyA9IG51bGw7XG5cblx0bGV0IHZlcnNpb25SZWdleCA9IC9eXFxzKiN2ZXJzaW9uIC4qJC9tO1xuXHRsZXQgdmVyc2lvbk1hdGNoID0gdmVyc2lvblJlZ2V4LmV4ZWMoZW50cnlTY3JpcHQuc2NyaXB0KTtcblxuXHRpZiAoaGFzVmFsdWUodmVyc2lvbk1hdGNoKSlcblx0e1xuXHRcdGxldCBhZnRlclZlcnNpb25JbmRleCA9IHZlcnNpb25NYXRjaC5pbmRleCArIHZlcnNpb25NYXRjaFswXS5sZW5ndGg7XG5cblx0XHR2ZXJzaW9uU3RyaW5nID0gdmVyc2lvbk1hdGNoWzBdLnRyaW0oKTtcblx0XHRlbnRyeVNjcmlwdC5zY3JpcHQgPSBlbnRyeVNjcmlwdC5zY3JpcHQuc3Vic3RyKGFmdGVyVmVyc2lvbkluZGV4KTtcblx0fVxuXG5cdC8vIGFwcGVuZCB2ZXJzaW9uIGFuZCBwcmVwcm9jZXNzb3IgbWFjcm9zXG5cdGxldCByZXN1bHQgPSBcIlwiO1xuXHRyZXN1bHQgPSBhcHBlbmRMaW5lKHJlc3VsdCwgdmVyc2lvblN0cmluZyk7XG5cblx0aWYgKGhhc1ZhbHVlKHByZXByb2Nlc3NvckRlZmluZXMpKVxuXHR7XG5cdFx0cHJlcHJvY2Vzc29yRGVmaW5lcy5mb3JFYWNoKFxuXHRcdFx0ZnVuY3Rpb24gKGRlZmluZSlcblx0XHRcdHtcblx0XHRcdFx0cmVzdWx0ID0gYXBwZW5kTGluZShyZXN1bHQsIGAjZGVmaW5lICR7ZGVmaW5lfWApO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvLyBidWlsZCB0aGUgc2NyaXB0XG5cdHJlc3VsdCA9IGF3YWl0IGJ1aWxkU2NyaXB0KHJlc3VsdCwgZW50cnlTY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgsIG9uRGVwZW5kZW5jeUxvYWRlZCk7XG5cblx0cmV0dXJuIHJlc3VsdC50cmltKCk7XG59XG5cbmludGVyZmFjZSBTY3JpcHRNYXBcbntcblx0W3NjcmlwdEZpbGVQYXRoOiBzdHJpbmddOiBTY3JpcHRJbmZvXG59XG5pbnRlcmZhY2UgUHJvY2Vzc2VkU2NyaXB0TWFwXG57XG5cdFtzY3JpcHRGaWxlUGF0aDogc3RyaW5nXTogYm9vbGVhblxufVxuXG5hc3luYyBmdW5jdGlvbiBidWlsZFNjcmlwdChcblx0cmVzdWx0OiBzdHJpbmcsXG5cdGVudHJ5U2NyaXB0OiBTY3JpcHRJbmZvLFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRvbkRlcGVuZGVuY3lMb2FkZWQ6IChkZXBlbmRlbmN5UGF0aDogc3RyaW5nKSA9PiB2b2lkKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBhbGxTY3JpcHRzOiBTY3JpcHRNYXAgPSB7fTtcblx0bGV0IHByb2Nlc3NlZFNjcmlwdHM6IFByb2Nlc3NlZFNjcmlwdE1hcCA9IHt9O1xuXHRsZXQgYW5jZXN0b3JzOiBQcm9jZXNzZWRTY3JpcHRNYXAgPSB7fTtcblxuXHRsZXQgZnVsbFNjcmlwdCA9IGF3YWl0IGluc2VydFNvcnRlZEluY2x1ZGVzKGVudHJ5U2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoLCBhbmNlc3RvcnMsIHByb2Nlc3NlZFNjcmlwdHMsIGFsbFNjcmlwdHMsIG9uRGVwZW5kZW5jeUxvYWRlZCk7XG5cblx0cmVzdWx0ID0gYXBwZW5kTGluZShyZXN1bHQsIGZ1bGxTY3JpcHQpO1xuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluc2VydFNvcnRlZEluY2x1ZGVzKFxuXHRjdXJyZW50U2NyaXB0OiBTY3JpcHRJbmZvLFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRjdXJyZW50U2NyaXB0QW5jZXN0b3JzOiBQcm9jZXNzZWRTY3JpcHRNYXAsXG5cdHByb2Nlc3NlZFNjcmlwdHM6IFByb2Nlc3NlZFNjcmlwdE1hcCxcblx0YWxsU2NyaXB0czogU2NyaXB0TWFwLFxuXHRvbkRlcGVuZGVuY3lMb2FkZWQ6IChkZXBlbmRlbmN5UGF0aDogc3RyaW5nKSA9PiB2b2lkKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBzY3JpcHRJbmNsdWRlcyA9IGF3YWl0IGdldFNjcmlwdEluY2x1ZGVzKGN1cnJlbnRTY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgsIGFsbFNjcmlwdHMsIG9uRGVwZW5kZW5jeUxvYWRlZCk7XG5cblx0bGV0IHJlc3VsdCA9IGN1cnJlbnRTY3JpcHQuc2NyaXB0O1xuXG5cdGxldCBpbmNsdWRlTWF0Y2hPZmZzZXQgPSAwO1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgc2NyaXB0SW5jbHVkZXMubGVuZ3RoOyBpKyspXG5cdHtcblx0XHRsZXQgc2NyaXB0SW5jbHVkZSA9IHNjcmlwdEluY2x1ZGVzW2ldO1xuXG5cdFx0aWYgKGN1cnJlbnRTY3JpcHRBbmNlc3RvcnNbc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGhdKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkN5Y2xlIGRldGVjdGVkXCIpO1xuXHRcdH1cblx0XHRpZiAoc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGggPT09IGN1cnJlbnRTY3JpcHQuc2NyaXB0RmlsZVBhdGgpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQXR0ZW1wdCB0byBpbmNsdWRlIHNlbGZcIik7XG5cdFx0fVxuXG5cdFx0bGV0IGJlZm9yZUluY2x1ZGUgPSByZXN1bHQuc3Vic3RyaW5nKDAsIGluY2x1ZGVNYXRjaE9mZnNldCArIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoT2Zmc2V0KTtcblx0XHRsZXQgYWZ0ZXJJbmNsdWRlID0gcmVzdWx0LnN1YnN0cmluZyhpbmNsdWRlTWF0Y2hPZmZzZXQgKyBzY3JpcHRJbmNsdWRlLmluY2x1ZGVNYXRjaE9mZnNldCArIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoTGVuZ3RoKTtcblxuXHRcdGxldCBpbmNsdWRlVmFsdWU6IHN0cmluZyA9IFwiXCI7XG5cblx0XHRpZiAocHJvY2Vzc2VkU2NyaXB0c1tzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aF0pXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coYFNjcmlwdCAke3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRofSBhbHJlYWR5IGluY2x1ZGVkYCk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRsZXQgY2hpbGRBbmNlc3RvcnMgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50U2NyaXB0QW5jZXN0b3JzKTtcblx0XHRcdGNoaWxkQW5jZXN0b3JzW2N1cnJlbnRTY3JpcHQuc2NyaXB0RmlsZVBhdGhdID0gdHJ1ZTtcblxuXHRcdFx0aW5jbHVkZVZhbHVlID0gYXdhaXQgaW5zZXJ0U29ydGVkSW5jbHVkZXMoc2NyaXB0SW5jbHVkZS5zY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgsIGNoaWxkQW5jZXN0b3JzLCBwcm9jZXNzZWRTY3JpcHRzLCBhbGxTY3JpcHRzLCBvbkRlcGVuZGVuY3lMb2FkZWQpO1xuXHRcdFx0aW5jbHVkZVZhbHVlID0gc2hhZGVyTmV3TGluZSArIGluY2x1ZGVWYWx1ZSArIHNoYWRlck5ld0xpbmU7XG5cblx0XHRcdHByb2Nlc3NlZFNjcmlwdHNbc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGhdID0gdHJ1ZVxuXHRcdH1cblxuXHRcdHJlc3VsdCA9IGJlZm9yZUluY2x1ZGUgKyBpbmNsdWRlVmFsdWUgKyBhZnRlckluY2x1ZGU7XG5cdFx0aW5jbHVkZU1hdGNoT2Zmc2V0ICs9IChpbmNsdWRlVmFsdWUubGVuZ3RoIC0gc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hMZW5ndGgpO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuaW50ZXJmYWNlIEluY2x1ZGVJbmZvXG57XG5cdHNjcmlwdDogU2NyaXB0SW5mbztcblx0aW5jbHVkZU1hdGNoT2Zmc2V0OiBudW1iZXI7XG5cdGluY2x1ZGVNYXRjaExlbmd0aDogbnVtYmVyO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRTY3JpcHRJbmNsdWRlcyhcblx0c2NyaXB0OiBTY3JpcHRJbmZvLFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRhbGxTY3JpcHRzOiBTY3JpcHRNYXAsXG5cdG9uRGVwZW5kZW5jeUxvYWRlZDogKGRlcGVuZGVuY3lQYXRoOiBzdHJpbmcpID0+IHZvaWQpOiBQcm9taXNlPEluY2x1ZGVJbmZvW10+XG57XG5cdGxldCBpbmNsdWRlczogSW5jbHVkZUluZm9bXSA9IFtdO1xuXG5cdGlmIChoYXNWYWx1ZShzY3JpcHQpKVxuXHR7XG5cdFx0bGV0IHJlZ2V4ID0gL15cXCNwcmFnbWEgaW5jbHVkZSBcXFwiKC4qKVxcXCIkL2dtO1xuXG5cdFx0bGV0IGluY2x1ZGVNYXRjaCA9IHJlZ2V4LmV4ZWMoc2NyaXB0LnNjcmlwdCk7XG5cblx0XHR3aGlsZSAoaW5jbHVkZU1hdGNoKVxuXHRcdHtcblx0XHRcdGxldCByZWxhdGl2ZUluY2x1ZGVGaWxlUGF0aCA9IGluY2x1ZGVNYXRjaFsxXTtcblxuXHRcdFx0bGV0IGluY2x1ZGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShzY3JpcHQuc2NyaXB0Rm9sZGVyUGF0aCwgcmVsYXRpdmVJbmNsdWRlRmlsZVBhdGgpO1xuXHRcdFx0bGV0IGluY2x1ZGVGb2xkZXJQYXRoID0gcGF0aC5kaXJuYW1lKGluY2x1ZGVGaWxlUGF0aCk7XG5cdFx0XHRsZXQgaW5jbHVkZUZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShpbmNsdWRlRmlsZVBhdGgpO1xuXG5cdFx0XHRsZXQgaW5jbHVkZVNjcmlwdCA9IGFsbFNjcmlwdHNbaW5jbHVkZUZpbGVQYXRoXTtcblxuXHRcdFx0aWYgKG51bGxPclVuZGVmaW5lZChpbmNsdWRlU2NyaXB0KSlcblx0XHRcdHtcblx0XHRcdFx0aW5jbHVkZVNjcmlwdCA9XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2NyaXB0OiBhd2FpdCByZWFkU2hhZGVyU2NyaXB0KGluY2x1ZGVGaWxlUGF0aCwgcmVhZFNjcmlwdCksXG5cdFx0XHRcdFx0XHRzY3JpcHRGaWxlUGF0aDogaW5jbHVkZUZpbGVQYXRoLFxuXHRcdFx0XHRcdFx0c2NyaXB0Rm9sZGVyUGF0aDogaW5jbHVkZUZvbGRlclBhdGgsXG5cdFx0XHRcdFx0XHRzY3JpcHRGaWxlTmFtZTogaW5jbHVkZUZpbGVOYW1lXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRvbkRlcGVuZGVuY3lMb2FkZWQoaW5jbHVkZUZpbGVQYXRoKTtcblxuXHRcdFx0XHRhbGxTY3JpcHRzW2luY2x1ZGVGaWxlUGF0aF0gPSBpbmNsdWRlU2NyaXB0O1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgaW5jbHVkZUluZm86IEluY2x1ZGVJbmZvID1cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNjcmlwdDogaW5jbHVkZVNjcmlwdCxcblx0XHRcdFx0XHRpbmNsdWRlTWF0Y2hPZmZzZXQ6IGluY2x1ZGVNYXRjaC5pbmRleCxcblx0XHRcdFx0XHRpbmNsdWRlTWF0Y2hMZW5ndGg6IGluY2x1ZGVNYXRjaFswXS5sZW5ndGhcblx0XHRcdFx0fTtcblxuXHRcdFx0aW5jbHVkZXMucHVzaChpbmNsdWRlSW5mbyk7XG5cblx0XHRcdGluY2x1ZGVNYXRjaCA9IHJlZ2V4LmV4ZWMoc2NyaXB0LnNjcmlwdCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGluY2x1ZGVzO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkU2hhZGVyU2NyaXB0KHBhdGg6IHN0cmluZywgcmVhZFNjcmlwdDogcmVhZFNjcmlwdCk6IFByb21pc2U8c3RyaW5nPlxue1xuXHRsZXQgc2NyaXB0ID0gYXdhaXQgcmVhZFNjcmlwdChwYXRoKTtcblx0cmV0dXJuIGZpeExpbmVFbmRpbmdzKHNjcmlwdCk7XG59XG5cbmZ1bmN0aW9uIGZpeExpbmVFbmRpbmdzKHNvdXJjZTogc3RyaW5nKVxue1xuXHRyZXR1cm4gc291cmNlLnJlcGxhY2UoXCJcXHJcXG5cIiwgc2hhZGVyTmV3TGluZSk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZExpbmUoY3VycmVudFZhbHVlOiBzdHJpbmcsIGxpbmVUb0FwcGVuZDogc3RyaW5nKTogc3RyaW5nXG57XG5cdGlmIChudWxsT3JVbmRlZmluZWQobGluZVRvQXBwZW5kKSlcblx0e1xuXHRcdHJldHVybiBjdXJyZW50VmFsdWU7XG5cdH1cblxuXHRyZXR1cm4gY3VycmVudFZhbHVlICsgbGluZVRvQXBwZW5kICsgc2hhZGVyTmV3TGluZTtcbn1cblxuZnVuY3Rpb24gaGFzVmFsdWUob2JqOiBhbnkpOiBib29sZWFuXG57XG5cdHJldHVybiAoZmFsc2UgPT0gbnVsbE9yVW5kZWZpbmVkKG9iaikpO1xufVxuXG5mdW5jdGlvbiBudWxsT3JVbmRlZmluZWQob2JqOiBhbnkpOiBib29sZWFuXG57XG5cdHJldHVybiAob2JqID09PSBudWxsKSB8fCAob2JqID09PSB1bmRlZmluZWQpO1xufVxuIl19