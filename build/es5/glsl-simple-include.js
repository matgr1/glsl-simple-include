"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = _promise2.default))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var stripBom = require("strip-bom");
var shaderNewLine = "\n";
function processIncludes(readScript, path, entryScriptPath, entryScript, preprocessorDefines) {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee() {
        var entryFilePath, entryFolderPath, entryFileName;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        entryFilePath = path.resolve(entryScriptPath);
                        entryFolderPath = path.dirname(entryFilePath);
                        entryFileName = path.basename(entryFilePath);

                        if (!(null === entryScript || undefined === entryScript)) {
                            _context.next = 9;
                            break;
                        }

                        _context.next = 6;
                        return readShaderScript(entryFilePath, readScript);

                    case 6:
                        entryScript = _context.sent;
                        _context.next = 10;
                        break;

                    case 9:
                        entryScript = fixScript(entryScript);

                    case 10:
                        _context.next = 12;
                        return processScript({
                            script: entryScript,
                            scriptFilePath: entryFilePath,
                            scriptFolderPath: entryFolderPath,
                            scriptFileName: entryFileName
                        }, readScript, path, preprocessorDefines);

                    case 12:
                        return _context.abrupt("return", _context.sent);

                    case 13:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
exports.processIncludes = processIncludes;
function processScript(entryScript, readScript, path, preprocessorDefines) {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee2() {
        var versionString, versionRegex, versionMatch, afterVersionIndex, result;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        // strip version
                        versionString = null;
                        versionRegex = /^\s*#version .*$/m;
                        versionMatch = versionRegex.exec(entryScript.script);

                        if (null !== versionMatch && undefined !== versionMatch) {
                            afterVersionIndex = versionMatch.index + versionMatch[0].length;

                            versionString = versionMatch[0].trim();
                            entryScript.script = entryScript.script.substr(afterVersionIndex);
                        }
                        // append version and preprocessor macros
                        result = "";

                        result = appendLine(result, versionString);
                        if (null !== preprocessorDefines && undefined !== preprocessorDefines) {
                            preprocessorDefines.forEach(function (define) {
                                result = appendLine(result, "#define " + define);
                            });
                        }
                        // build the script
                        _context2.next = 9;
                        return buildScript(result, entryScript, readScript, path);

                    case 9:
                        result = _context2.sent;
                        return _context2.abrupt("return", result.trim());

                    case 11:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
}
function buildScript(result, entryScript, readScript, path) {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee3() {
        var allScripts, processedScripts, ancestors, fullScript;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        allScripts = {};
                        processedScripts = {};
                        ancestors = {};
                        _context3.next = 5;
                        return insertSortedIncludes(entryScript, readScript, path, ancestors, processedScripts, allScripts);

                    case 5:
                        fullScript = _context3.sent;

                        result = appendLine(result, fullScript);
                        return _context3.abrupt("return", result);

                    case 8:
                    case "end":
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));
}
function insertSortedIncludes(currentScript, readScript, path, currentScriptAncestors, processedScripts, allScripts) {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee4() {
        var scriptIncludes, result, includeMatchOffset, i, scriptInclude, beforeInclude, afterInclude, includeValue, childAncestors;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return getScriptIncludes(currentScript, readScript, path, allScripts);

                    case 2:
                        scriptIncludes = _context4.sent;
                        result = currentScript.script;
                        includeMatchOffset = 0;
                        i = 0;

                    case 6:
                        if (!(i < scriptIncludes.length)) {
                            _context4.next = 31;
                            break;
                        }

                        scriptInclude = scriptIncludes[i];

                        if (!currentScriptAncestors[scriptInclude.script.scriptFilePath]) {
                            _context4.next = 10;
                            break;
                        }

                        throw new Error("Cycle detected");

                    case 10:
                        if (!(scriptInclude.script.scriptFilePath === currentScript.scriptFilePath)) {
                            _context4.next = 12;
                            break;
                        }

                        throw new Error("Attempt to include self");

                    case 12:
                        beforeInclude = result.substring(0, includeMatchOffset + scriptInclude.includeMatchOffset);
                        afterInclude = result.substring(includeMatchOffset + scriptInclude.includeMatchOffset + scriptInclude.includeMatchLength);
                        includeValue = "";

                        if (!processedScripts[scriptInclude.script.scriptFilePath]) {
                            _context4.next = 19;
                            break;
                        }

                        console.log("Script " + scriptInclude.script.scriptFilePath + " already included");
                        _context4.next = 26;
                        break;

                    case 19:
                        childAncestors = (0, _assign2.default)({}, currentScriptAncestors);

                        childAncestors[currentScript.scriptFilePath] = true;
                        _context4.next = 23;
                        return insertSortedIncludes(scriptInclude.script, readScript, path, childAncestors, processedScripts, allScripts);

                    case 23:
                        includeValue = _context4.sent;

                        includeValue = shaderNewLine + includeValue + shaderNewLine;
                        processedScripts[scriptInclude.script.scriptFilePath] = true;

                    case 26:
                        result = beforeInclude + includeValue + afterInclude;
                        includeMatchOffset += includeValue.length - scriptInclude.includeMatchLength;

                    case 28:
                        i++;
                        _context4.next = 6;
                        break;

                    case 31:
                        return _context4.abrupt("return", result);

                    case 32:
                    case "end":
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));
}
function getScriptIncludes(script, readScript, path, allScripts) {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee5() {
        var includes, regex, includeMatch, relativeIncludeFilePath, includeFilePath, includeFolderPath, includeFileName, includeScript, includeInfo;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        includes = [];

                        if (!(null !== script && undefined !== script)) {
                            _context5.next = 24;
                            break;
                        }

                        regex = /^\#pragma include \"(.*)\"$/gm;
                        includeMatch = regex.exec(script.script);

                    case 4:
                        if (!includeMatch) {
                            _context5.next = 24;
                            break;
                        }

                        relativeIncludeFilePath = includeMatch[1];
                        includeFilePath = path.resolve(script.scriptFolderPath, relativeIncludeFilePath);
                        includeFolderPath = path.dirname(includeFilePath);
                        includeFileName = path.basename(includeFilePath);
                        includeScript = allScripts[includeFilePath];

                        if (!(null === includeScript || undefined === includeScript)) {
                            _context5.next = 19;
                            break;
                        }

                        _context5.next = 13;
                        return readShaderScript(includeFilePath, readScript);

                    case 13:
                        _context5.t0 = _context5.sent;
                        _context5.t1 = includeFilePath;
                        _context5.t2 = includeFolderPath;
                        _context5.t3 = includeFileName;
                        includeScript = {
                            script: _context5.t0,
                            scriptFilePath: _context5.t1,
                            scriptFolderPath: _context5.t2,
                            scriptFileName: _context5.t3
                        };

                        allScripts[includeFilePath] = includeScript;

                    case 19:
                        includeInfo = {
                            script: includeScript,
                            includeMatchOffset: includeMatch.index,
                            includeMatchLength: includeMatch[0].length
                        };

                        includes.push(includeInfo);
                        includeMatch = regex.exec(script.script);
                        _context5.next = 4;
                        break;

                    case 24:
                        return _context5.abrupt("return", includes);

                    case 25:
                    case "end":
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));
}
function readShaderScript(path, readScript) {
    return __awaiter(this, void 0, void 0, _regenerator2.default.mark(function _callee6() {
        var script;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.next = 2;
                        return readScript(path);

                    case 2:
                        script = _context6.sent;
                        return _context6.abrupt("return", fixScript(script));

                    case 4:
                    case "end":
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));
}
function fixScript(source) {
    return fixLineEndings(stripBom(source));
}
function fixLineEndings(source) {
    return source.replace("\r\n", shaderNewLine);
}
function appendLine(currentValue, lineToAppend) {
    if (null === lineToAppend || undefined === lineToAppend) {
        return currentValue;
    }
    return currentValue + lineToAppend + shaderNewLine;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xzbC1zaW1wbGUtaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nbHNsLXNpbXBsZS1pbmNsdWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxJQUFJLEFBQVEsV0FBRyxBQUFPLFFBQUMsQUFBVyxBQUFDLEFBQUM7QUFXcEMsSUFBTSxBQUFhLGdCQUFHLEFBQUksQUFBQztBQUUzQix5QkFDQyxBQUFzQixZQUN0QixBQUFVLE1BQ1YsQUFBdUIsaUJBQ3ZCLEFBQW9CLGFBQ3BCLEFBQThCOztBQUU5Qjs7Ozs7QUFBSSxBQUFhLHdDQUFHLEFBQUksS0FBQyxBQUFPLFFBQUMsQUFBZSxBQUFDLEFBQUMsQUFDbEQ7QUFBSSxBQUFlLDBDQUFHLEFBQUksS0FBQyxBQUFPLFFBQUMsQUFBYSxBQUFDLEFBQUMsQUFDbEQ7QUFBSSxBQUFhLHdDQUFHLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBYSxBQUFDLEFBQUMsQUFFakQsQUFBRSxBQUFDOzs4QkFBRSxBQUFJLFNBQUssQUFBVyxBQUFDLEFBQUksV0FBMUIsSUFBMkIsQUFBUyxjQUFLLEFBQVcsQUFBQyxBQUFDLEFBQzFELEFBQUM7Ozs7OzsrQkFDb0IsQUFBZ0IsaUJBQUMsQUFBYSxlQUFFLEFBQVUsQUFBQyxBQUFDLEFBQ2pFLEFBQUMsQUFDRCxBQUFJLEFBQ0osQUFBQzs7O0FBSEEsQUFBVyxBQUFHOzs7OztBQUlkLEFBQVcsc0NBQUcsQUFBUyxVQUFDLEFBQVcsQUFBQyxBQUFDLEFBQ3RDLEFBQUMsQUFFRCxBQUFNLEFBQUM7Ozs7O0FBRUwsQUFBTSxvQ0FBRSxBQUFXO0FBQ25CLEFBQWMsNENBQUUsQUFBYTtBQUM3QixBQUFnQiw4Q0FBRSxBQUFlO0FBQ2pDLEFBQWMsNENBQUUsQUFBYSxBQUM3QjtBQUxELHlCQURZLEFBQWEsRUFPekIsQUFBVSxZQUNWLEFBQUksTUFDSixBQUFtQixB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QUFBTSxBQUFDLEFBQUMsQUFBQyxBQUN6QztBQUFDO0FBRUQsd0JBQXdCLEFBQWM7QUFFckMsQUFBTSxXQUFDLEFBQU0sT0FBQyxBQUFPLFFBQUMsQUFBTSxRQUFFLEFBQWEsQUFBQyxBQUFDLEFBQzlDO0FBQUM7QUFFRCxvQkFBb0IsQUFBb0IsY0FBRSxBQUFvQjtBQUU3RCxBQUFFLEFBQUMsUUFBRSxBQUFJLFNBQUssQUFBWSxBQUFDLEFBQUksWUFBM0IsSUFBNEIsQUFBUyxjQUFLLEFBQVksQUFBQyxBQUFDLGNBQzVELEFBQUM7QUFDQSxBQUFNLGVBQUMsQUFBWSxBQUFDLEFBQ3JCO0FBQUM7QUFFRCxBQUFNLFdBQUMsQUFBWSxlQUFHLEFBQVksZUFBRyxBQUFhLEFBQUMsQUFDcEQ7QUFBQyIsInNvdXJjZXNDb250ZW50IjpbImRlY2xhcmUgbGV0IHJlcXVpcmU6IGFueTtcbmxldCBzdHJpcEJvbSA9IHJlcXVpcmUoXCJzdHJpcC1ib21cIik7XG5cbmV4cG9ydCB0eXBlIHJlYWRTY3JpcHQgPSAocGF0aDogc3RyaW5nKSA9PiBQcm9taXNlPHN0cmluZz47XG5cbmV4cG9ydCBpbnRlcmZhY2UgcGF0aFxue1xuXHRyZXNvbHZlKC4uLnBhdGg6IHN0cmluZ1tdKTogc3RyaW5nO1xuXHRkaXJuYW1lKHBhdGg6IHN0cmluZyk6IHN0cmluZztcblx0YmFzZW5hbWUocGF0aDogc3RyaW5nLCBleHQ/OiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cbmNvbnN0IHNoYWRlck5ld0xpbmUgPSBcIlxcblwiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0luY2x1ZGVzKFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRlbnRyeVNjcmlwdFBhdGg6IHN0cmluZyxcblx0ZW50cnlTY3JpcHQ/OiBzdHJpbmcsXG5cdHByZXByb2Nlc3NvckRlZmluZXM/OiBzdHJpbmdbXSk6IFByb21pc2U8c3RyaW5nPlxue1xuXHRsZXQgZW50cnlGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShlbnRyeVNjcmlwdFBhdGgpO1xuXHRsZXQgZW50cnlGb2xkZXJQYXRoID0gcGF0aC5kaXJuYW1lKGVudHJ5RmlsZVBhdGgpO1xuXHRsZXQgZW50cnlGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoZW50cnlGaWxlUGF0aCk7XG5cblx0aWYgKChudWxsID09PSBlbnRyeVNjcmlwdCkgfHwgKHVuZGVmaW5lZCA9PT0gZW50cnlTY3JpcHQpKVxuXHR7XG5cdFx0ZW50cnlTY3JpcHQgPSBhd2FpdCByZWFkU2hhZGVyU2NyaXB0KGVudHJ5RmlsZVBhdGgsIHJlYWRTY3JpcHQpO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGVudHJ5U2NyaXB0ID0gZml4U2NyaXB0KGVudHJ5U2NyaXB0KTtcblx0fVxuXG5cdHJldHVybiBhd2FpdCBwcm9jZXNzU2NyaXB0KFxuXHRcdHtcblx0XHRcdHNjcmlwdDogZW50cnlTY3JpcHQsXG5cdFx0XHRzY3JpcHRGaWxlUGF0aDogZW50cnlGaWxlUGF0aCxcblx0XHRcdHNjcmlwdEZvbGRlclBhdGg6IGVudHJ5Rm9sZGVyUGF0aCxcblx0XHRcdHNjcmlwdEZpbGVOYW1lOiBlbnRyeUZpbGVOYW1lXG5cdFx0fSxcblx0XHRyZWFkU2NyaXB0LFxuXHRcdHBhdGgsXG5cdFx0cHJlcHJvY2Vzc29yRGVmaW5lcyk7XG59XG5cbmludGVyZmFjZSBTY3JpcHRJbmZvXG57XG5cdHNjcmlwdDogc3RyaW5nO1xuXHRzY3JpcHRGaWxlUGF0aDogc3RyaW5nO1xuXHRzY3JpcHRGb2xkZXJQYXRoOiBzdHJpbmc7XG5cdHNjcmlwdEZpbGVOYW1lOiBzdHJpbmc7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NTY3JpcHQoXG5cdGVudHJ5U2NyaXB0OiBTY3JpcHRJbmZvLFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRwcmVwcm9jZXNzb3JEZWZpbmVzPzogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz5cbntcblx0Ly8gc3RyaXAgdmVyc2lvblxuXHRsZXQgdmVyc2lvblN0cmluZzogc3RyaW5nID0gbnVsbDtcblxuXHRsZXQgdmVyc2lvblJlZ2V4ID0gL15cXHMqI3ZlcnNpb24gLiokL207XG5cdGxldCB2ZXJzaW9uTWF0Y2ggPSB2ZXJzaW9uUmVnZXguZXhlYyhlbnRyeVNjcmlwdC5zY3JpcHQpO1xuXG5cdGlmICgobnVsbCAhPT0gdmVyc2lvbk1hdGNoKSAmJiAodW5kZWZpbmVkICE9PSB2ZXJzaW9uTWF0Y2gpKVxuXHR7XG5cdFx0bGV0IGFmdGVyVmVyc2lvbkluZGV4ID0gdmVyc2lvbk1hdGNoLmluZGV4ICsgdmVyc2lvbk1hdGNoWzBdLmxlbmd0aDtcblxuXHRcdHZlcnNpb25TdHJpbmcgPSB2ZXJzaW9uTWF0Y2hbMF0udHJpbSgpO1xuXHRcdGVudHJ5U2NyaXB0LnNjcmlwdCA9IGVudHJ5U2NyaXB0LnNjcmlwdC5zdWJzdHIoYWZ0ZXJWZXJzaW9uSW5kZXgpO1xuXHR9XG5cblx0Ly8gYXBwZW5kIHZlcnNpb24gYW5kIHByZXByb2Nlc3NvciBtYWNyb3Ncblx0bGV0IHJlc3VsdCA9IFwiXCI7XG5cdHJlc3VsdCA9IGFwcGVuZExpbmUocmVzdWx0LCB2ZXJzaW9uU3RyaW5nKTtcblxuXHRpZiAoKG51bGwgIT09IHByZXByb2Nlc3NvckRlZmluZXMpICYmICh1bmRlZmluZWQgIT09IHByZXByb2Nlc3NvckRlZmluZXMpKVxuXHR7XG5cdFx0cHJlcHJvY2Vzc29yRGVmaW5lcy5mb3JFYWNoKFxuXHRcdFx0ZnVuY3Rpb24gKGRlZmluZSlcblx0XHRcdHtcblx0XHRcdFx0cmVzdWx0ID0gYXBwZW5kTGluZShyZXN1bHQsIGAjZGVmaW5lICR7ZGVmaW5lfWApO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvLyBidWlsZCB0aGUgc2NyaXB0XG5cdHJlc3VsdCA9IGF3YWl0IGJ1aWxkU2NyaXB0KHJlc3VsdCwgZW50cnlTY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgpO1xuXG5cdHJldHVybiByZXN1bHQudHJpbSgpO1xufVxuXG5pbnRlcmZhY2UgU2NyaXB0TWFwXG57XG5cdFtzY3JpcHRGaWxlUGF0aDogc3RyaW5nXTogU2NyaXB0SW5mb1xufVxuaW50ZXJmYWNlIFByb2Nlc3NlZFNjcmlwdE1hcFxue1xuXHRbc2NyaXB0RmlsZVBhdGg6IHN0cmluZ106IGJvb2xlYW5cbn1cblxuYXN5bmMgZnVuY3Rpb24gYnVpbGRTY3JpcHQocmVzdWx0OiBzdHJpbmcsIGVudHJ5U2NyaXB0OiBTY3JpcHRJbmZvLCByZWFkU2NyaXB0OiByZWFkU2NyaXB0LCBwYXRoOiBwYXRoKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBhbGxTY3JpcHRzOiBTY3JpcHRNYXAgPSB7fTtcblx0bGV0IHByb2Nlc3NlZFNjcmlwdHM6IFByb2Nlc3NlZFNjcmlwdE1hcCA9IHt9O1xuXHRsZXQgYW5jZXN0b3JzOiBQcm9jZXNzZWRTY3JpcHRNYXAgPSB7fTtcblxuXHRsZXQgZnVsbFNjcmlwdCA9IGF3YWl0IGluc2VydFNvcnRlZEluY2x1ZGVzKGVudHJ5U2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoLCBhbmNlc3RvcnMsIHByb2Nlc3NlZFNjcmlwdHMsIGFsbFNjcmlwdHMpO1xuXG5cdHJlc3VsdCA9IGFwcGVuZExpbmUocmVzdWx0LCBmdWxsU2NyaXB0KTtcblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbnNlcnRTb3J0ZWRJbmNsdWRlcyhcblx0Y3VycmVudFNjcmlwdDogU2NyaXB0SW5mbyxcblx0cmVhZFNjcmlwdDogcmVhZFNjcmlwdCxcblx0cGF0aDogcGF0aCxcblx0Y3VycmVudFNjcmlwdEFuY2VzdG9yczogUHJvY2Vzc2VkU2NyaXB0TWFwLFxuXHRwcm9jZXNzZWRTY3JpcHRzOiBQcm9jZXNzZWRTY3JpcHRNYXAsXG5cdGFsbFNjcmlwdHM6IFNjcmlwdE1hcCk6IFByb21pc2U8c3RyaW5nPlxue1xuXHRsZXQgc2NyaXB0SW5jbHVkZXMgPSBhd2FpdCBnZXRTY3JpcHRJbmNsdWRlcyhjdXJyZW50U2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoLCBhbGxTY3JpcHRzKTtcblxuXHRsZXQgcmVzdWx0ID0gY3VycmVudFNjcmlwdC5zY3JpcHQ7XG5cblx0bGV0IGluY2x1ZGVNYXRjaE9mZnNldCA9IDA7XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzY3JpcHRJbmNsdWRlcy5sZW5ndGg7IGkrKylcblx0e1xuXHRcdGxldCBzY3JpcHRJbmNsdWRlID0gc2NyaXB0SW5jbHVkZXNbaV07XG5cblx0XHRpZiAoY3VycmVudFNjcmlwdEFuY2VzdG9yc1tzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aF0pXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ3ljbGUgZGV0ZWN0ZWRcIik7XG5cdFx0fVxuXHRcdGlmIChzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aCA9PT0gY3VycmVudFNjcmlwdC5zY3JpcHRGaWxlUGF0aClcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBdHRlbXB0IHRvIGluY2x1ZGUgc2VsZlwiKTtcblx0XHR9XG5cblx0XHRsZXQgYmVmb3JlSW5jbHVkZSA9IHJlc3VsdC5zdWJzdHJpbmcoMCwgaW5jbHVkZU1hdGNoT2Zmc2V0ICsgc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hPZmZzZXQpO1xuXHRcdGxldCBhZnRlckluY2x1ZGUgPSByZXN1bHQuc3Vic3RyaW5nKGluY2x1ZGVNYXRjaE9mZnNldCArIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoT2Zmc2V0ICsgc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hMZW5ndGgpO1xuXG5cdFx0bGV0IGluY2x1ZGVWYWx1ZTogc3RyaW5nID0gXCJcIjtcblxuXHRcdGlmIChwcm9jZXNzZWRTY3JpcHRzW3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoXSlcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhgU2NyaXB0ICR7c2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGh9IGFscmVhZHkgaW5jbHVkZWRgKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxldCBjaGlsZEFuY2VzdG9ycyA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRTY3JpcHRBbmNlc3RvcnMpO1xuXHRcdFx0Y2hpbGRBbmNlc3RvcnNbY3VycmVudFNjcmlwdC5zY3JpcHRGaWxlUGF0aF0gPSB0cnVlO1xuXG5cdFx0XHRpbmNsdWRlVmFsdWUgPSBhd2FpdCBpbnNlcnRTb3J0ZWRJbmNsdWRlcyhzY3JpcHRJbmNsdWRlLnNjcmlwdCwgcmVhZFNjcmlwdCwgcGF0aCwgY2hpbGRBbmNlc3RvcnMsIHByb2Nlc3NlZFNjcmlwdHMsIGFsbFNjcmlwdHMpO1xuXHRcdFx0aW5jbHVkZVZhbHVlID0gc2hhZGVyTmV3TGluZSArIGluY2x1ZGVWYWx1ZSArIHNoYWRlck5ld0xpbmU7XG5cblx0XHRcdHByb2Nlc3NlZFNjcmlwdHNbc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGhdID0gdHJ1ZVxuXHRcdH1cblxuXHRcdHJlc3VsdCA9IGJlZm9yZUluY2x1ZGUgKyBpbmNsdWRlVmFsdWUgKyBhZnRlckluY2x1ZGU7XG5cdFx0aW5jbHVkZU1hdGNoT2Zmc2V0ICs9IChpbmNsdWRlVmFsdWUubGVuZ3RoIC0gc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hMZW5ndGgpO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuaW50ZXJmYWNlIEluY2x1ZGVJbmZvXG57XG5cdHNjcmlwdDogU2NyaXB0SW5mbztcblx0aW5jbHVkZU1hdGNoT2Zmc2V0OiBudW1iZXI7XG5cdGluY2x1ZGVNYXRjaExlbmd0aDogbnVtYmVyO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRTY3JpcHRJbmNsdWRlcyhcblx0c2NyaXB0OiBTY3JpcHRJbmZvLFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRhbGxTY3JpcHRzOiBTY3JpcHRNYXApOiBQcm9taXNlPEluY2x1ZGVJbmZvW10+XG57XG5cdGxldCBpbmNsdWRlczogSW5jbHVkZUluZm9bXSA9IFtdO1xuXG5cdGlmICgobnVsbCAhPT0gc2NyaXB0KSAmJiAodW5kZWZpbmVkICE9PSBzY3JpcHQpKVxuXHR7XG5cdFx0bGV0IHJlZ2V4ID0gL15cXCNwcmFnbWEgaW5jbHVkZSBcXFwiKC4qKVxcXCIkL2dtO1xuXG5cdFx0bGV0IGluY2x1ZGVNYXRjaCA9IHJlZ2V4LmV4ZWMoc2NyaXB0LnNjcmlwdCk7XG5cblx0XHR3aGlsZSAoaW5jbHVkZU1hdGNoKVxuXHRcdHtcblx0XHRcdGxldCByZWxhdGl2ZUluY2x1ZGVGaWxlUGF0aCA9IGluY2x1ZGVNYXRjaFsxXTtcblxuXHRcdFx0bGV0IGluY2x1ZGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShzY3JpcHQuc2NyaXB0Rm9sZGVyUGF0aCwgcmVsYXRpdmVJbmNsdWRlRmlsZVBhdGgpO1xuXHRcdFx0bGV0IGluY2x1ZGVGb2xkZXJQYXRoID0gcGF0aC5kaXJuYW1lKGluY2x1ZGVGaWxlUGF0aCk7XG5cdFx0XHRsZXQgaW5jbHVkZUZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShpbmNsdWRlRmlsZVBhdGgpO1xuXG5cdFx0XHRsZXQgaW5jbHVkZVNjcmlwdCA9IGFsbFNjcmlwdHNbaW5jbHVkZUZpbGVQYXRoXTtcblxuXHRcdFx0aWYgKChudWxsID09PSBpbmNsdWRlU2NyaXB0KSB8fCAodW5kZWZpbmVkID09PSBpbmNsdWRlU2NyaXB0KSlcblx0XHRcdHtcblx0XHRcdFx0aW5jbHVkZVNjcmlwdCA9XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2NyaXB0OiBhd2FpdCByZWFkU2hhZGVyU2NyaXB0KGluY2x1ZGVGaWxlUGF0aCwgcmVhZFNjcmlwdCksXG5cdFx0XHRcdFx0XHRzY3JpcHRGaWxlUGF0aDogaW5jbHVkZUZpbGVQYXRoLFxuXHRcdFx0XHRcdFx0c2NyaXB0Rm9sZGVyUGF0aDogaW5jbHVkZUZvbGRlclBhdGgsXG5cdFx0XHRcdFx0XHRzY3JpcHRGaWxlTmFtZTogaW5jbHVkZUZpbGVOYW1lXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0YWxsU2NyaXB0c1tpbmNsdWRlRmlsZVBhdGhdID0gaW5jbHVkZVNjcmlwdDtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGluY2x1ZGVJbmZvOiBJbmNsdWRlSW5mbyA9XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzY3JpcHQ6IGluY2x1ZGVTY3JpcHQsXG5cdFx0XHRcdFx0aW5jbHVkZU1hdGNoT2Zmc2V0OiBpbmNsdWRlTWF0Y2guaW5kZXgsXG5cdFx0XHRcdFx0aW5jbHVkZU1hdGNoTGVuZ3RoOiBpbmNsdWRlTWF0Y2hbMF0ubGVuZ3RoXG5cdFx0XHRcdH07XG5cblx0XHRcdGluY2x1ZGVzLnB1c2goaW5jbHVkZUluZm8pO1xuXG5cdFx0XHRpbmNsdWRlTWF0Y2ggPSByZWdleC5leGVjKHNjcmlwdC5zY3JpcHQpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBpbmNsdWRlcztcbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVhZFNoYWRlclNjcmlwdChwYXRoOiBzdHJpbmcsIHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQpOiBQcm9taXNlPHN0cmluZz5cbntcblx0bGV0IHNjcmlwdCA9IGF3YWl0IHJlYWRTY3JpcHQocGF0aCk7XG5cdHJldHVybiBmaXhTY3JpcHQoc2NyaXB0KTtcbn1cblxuZnVuY3Rpb24gZml4U2NyaXB0KHNvdXJjZTogc3RyaW5nKVxue1xuXHRyZXR1cm4gZml4TGluZUVuZGluZ3Moc3RyaXBCb20oc291cmNlKSk7XG59XG5cbmZ1bmN0aW9uIGZpeExpbmVFbmRpbmdzKHNvdXJjZTogc3RyaW5nKVxue1xuXHRyZXR1cm4gc291cmNlLnJlcGxhY2UoXCJcXHJcXG5cIiwgc2hhZGVyTmV3TGluZSk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZExpbmUoY3VycmVudFZhbHVlOiBzdHJpbmcsIGxpbmVUb0FwcGVuZDogc3RyaW5nKTogc3RyaW5nXG57XG5cdGlmICgobnVsbCA9PT0gbGluZVRvQXBwZW5kKSB8fCAodW5kZWZpbmVkID09PSBsaW5lVG9BcHBlbmQpKVxuXHR7XG5cdFx0cmV0dXJuIGN1cnJlbnRWYWx1ZTtcblx0fVxuXG5cdHJldHVybiBjdXJyZW50VmFsdWUgKyBsaW5lVG9BcHBlbmQgKyBzaGFkZXJOZXdMaW5lO1xufVxuIl19