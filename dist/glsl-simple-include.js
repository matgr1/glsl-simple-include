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
                        entryScript = fixLineEndings(entryScript);

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
                        return _context6.abrupt("return", fixLineEndings(script));

                    case 4:
                    case "end":
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xzbC1zaW1wbGUtaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9nbHNsLXNpbXBsZS1pbmNsdWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFTQSxJQUFNLEFBQWEsZ0JBQUcsQUFBSSxBQUFDO0FBRTNCLHlCQUNDLEFBQXNCLFlBQ3RCLEFBQVUsTUFDVixBQUF1QixpQkFDdkIsQUFBb0IsYUFDcEIsQUFBOEI7O0FBRTlCOzs7OztBQUFJLEFBQWEsd0NBQUcsQUFBSSxLQUFDLEFBQU8sUUFBQyxBQUFlLEFBQUMsQUFBQyxBQUNsRDtBQUFJLEFBQWUsMENBQUcsQUFBSSxLQUFDLEFBQU8sUUFBQyxBQUFhLEFBQUMsQUFBQyxBQUNsRDtBQUFJLEFBQWEsd0NBQUcsQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFhLEFBQUMsQUFBQyxBQUVqRCxBQUFFLEFBQUM7OzhCQUFFLEFBQUksU0FBSyxBQUFXLEFBQUMsQUFBSSxXQUExQixJQUEyQixBQUFTLGNBQUssQUFBVyxBQUFDLEFBQUMsQUFDMUQsQUFBQzs7Ozs7OytCQUNvQixBQUFnQixpQkFBQyxBQUFhLGVBQUUsQUFBVSxBQUFDLEFBQUMsQUFDakUsQUFBQyxBQUNELEFBQUksQUFDSixBQUFDOzs7QUFIQSxBQUFXLEFBQUc7Ozs7O0FBSWQsQUFBVyxzQ0FBRyxBQUFjLGVBQUMsQUFBVyxBQUFDLEFBQUMsQUFDM0MsQUFBQyxBQUVELEFBQU0sQUFBQzs7Ozs7QUFFTCxBQUFNLG9DQUFFLEFBQVc7QUFDbkIsQUFBYyw0Q0FBRSxBQUFhO0FBQzdCLEFBQWdCLDhDQUFFLEFBQWU7QUFDakMsQUFBYyw0Q0FBRSxBQUFhLEFBQzdCO0FBTEQseUJBRFksQUFBYSxFQU96QixBQUFVLFlBQ1YsQUFBSSxNQUNKLEFBQW1CLEFBQUMsQUFBQyxBQUN2QixBQUFDOzs7Ozs7Ozs7Ozs7O0FBOUJxQixRQUFlLGtCQThC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QUFvQixjQUFFLEFBQW9CO0FBRTdELEFBQUUsQUFBQyxRQUFFLEFBQUksU0FBSyxBQUFZLEFBQUMsQUFBSSxZQUEzQixJQUE0QixBQUFTLGNBQUssQUFBWSxBQUFDLEFBQUMsY0FDNUQsQUFBQztBQUNBLEFBQU0sZUFBQyxBQUFZLEFBQUMsQUFDckI7QUFBQztBQUVELEFBQU0sV0FBQyxBQUFZLGVBQUcsQUFBWSxlQUFHLEFBQWEsQUFBQyxBQUNwRDtBQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHR5cGUgcmVhZFNjcmlwdCA9IChwYXRoOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nPjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgcGF0aFxyXG57XHJcblx0cmVzb2x2ZSguLi5wYXRoOiBzdHJpbmdbXSk6IHN0cmluZztcclxuXHRkaXJuYW1lKHBhdGg6IHN0cmluZyk6IHN0cmluZztcclxuXHRiYXNlbmFtZShwYXRoOiBzdHJpbmcsIGV4dD86IHN0cmluZyk6IHN0cmluZztcclxufVxyXG5cclxuY29uc3Qgc2hhZGVyTmV3TGluZSA9IFwiXFxuXCI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0luY2x1ZGVzKFxyXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXHJcblx0cGF0aDogcGF0aCxcclxuXHRlbnRyeVNjcmlwdFBhdGg6IHN0cmluZyxcclxuXHRlbnRyeVNjcmlwdD86IHN0cmluZyxcclxuXHRwcmVwcm9jZXNzb3JEZWZpbmVzPzogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz5cclxue1xyXG5cdGxldCBlbnRyeUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGVudHJ5U2NyaXB0UGF0aCk7XHJcblx0bGV0IGVudHJ5Rm9sZGVyUGF0aCA9IHBhdGguZGlybmFtZShlbnRyeUZpbGVQYXRoKTtcclxuXHRsZXQgZW50cnlGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoZW50cnlGaWxlUGF0aCk7XHJcblxyXG5cdGlmICgobnVsbCA9PT0gZW50cnlTY3JpcHQpIHx8ICh1bmRlZmluZWQgPT09IGVudHJ5U2NyaXB0KSlcclxuXHR7XHJcblx0XHRlbnRyeVNjcmlwdCA9IGF3YWl0IHJlYWRTaGFkZXJTY3JpcHQoZW50cnlGaWxlUGF0aCwgcmVhZFNjcmlwdCk7XHJcblx0fVxyXG5cdGVsc2VcclxuXHR7XHJcblx0XHRlbnRyeVNjcmlwdCA9IGZpeExpbmVFbmRpbmdzKGVudHJ5U2NyaXB0KTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBhd2FpdCBwcm9jZXNzU2NyaXB0KFxyXG5cdFx0e1xyXG5cdFx0XHRzY3JpcHQ6IGVudHJ5U2NyaXB0LFxyXG5cdFx0XHRzY3JpcHRGaWxlUGF0aDogZW50cnlGaWxlUGF0aCxcclxuXHRcdFx0c2NyaXB0Rm9sZGVyUGF0aDogZW50cnlGb2xkZXJQYXRoLFxyXG5cdFx0XHRzY3JpcHRGaWxlTmFtZTogZW50cnlGaWxlTmFtZVxyXG5cdFx0fSxcclxuXHRcdHJlYWRTY3JpcHQsXHJcblx0XHRwYXRoLFxyXG5cdFx0cHJlcHJvY2Vzc29yRGVmaW5lcyk7XHJcbn1cclxuXHJcbmludGVyZmFjZSBTY3JpcHRJbmZvXHJcbntcclxuXHRzY3JpcHQ6IHN0cmluZztcclxuXHRzY3JpcHRGaWxlUGF0aDogc3RyaW5nO1xyXG5cdHNjcmlwdEZvbGRlclBhdGg6IHN0cmluZztcclxuXHRzY3JpcHRGaWxlTmFtZTogc3RyaW5nO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzU2NyaXB0KFxyXG5cdGVudHJ5U2NyaXB0OiBTY3JpcHRJbmZvLFxyXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXHJcblx0cGF0aDogcGF0aCxcclxuXHRwcmVwcm9jZXNzb3JEZWZpbmVzPzogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz5cclxue1xyXG5cdC8vIHN0cmlwIHZlcnNpb25cclxuXHRsZXQgdmVyc2lvblN0cmluZzogc3RyaW5nID0gbnVsbDtcclxuXHJcblx0bGV0IHZlcnNpb25SZWdleCA9IC9eXFxzKiN2ZXJzaW9uIC4qJC9tO1xyXG5cdGxldCB2ZXJzaW9uTWF0Y2ggPSB2ZXJzaW9uUmVnZXguZXhlYyhlbnRyeVNjcmlwdC5zY3JpcHQpO1xyXG5cclxuXHRpZiAoKG51bGwgIT09IHZlcnNpb25NYXRjaCkgJiYgKHVuZGVmaW5lZCAhPT0gdmVyc2lvbk1hdGNoKSlcclxuXHR7XHJcblx0XHRsZXQgYWZ0ZXJWZXJzaW9uSW5kZXggPSB2ZXJzaW9uTWF0Y2guaW5kZXggKyB2ZXJzaW9uTWF0Y2hbMF0ubGVuZ3RoO1xyXG5cclxuXHRcdHZlcnNpb25TdHJpbmcgPSB2ZXJzaW9uTWF0Y2hbMF0udHJpbSgpO1xyXG5cdFx0ZW50cnlTY3JpcHQuc2NyaXB0ID0gZW50cnlTY3JpcHQuc2NyaXB0LnN1YnN0cihhZnRlclZlcnNpb25JbmRleCk7XHJcblx0fVxyXG5cclxuXHQvLyBhcHBlbmQgdmVyc2lvbiBhbmQgcHJlcHJvY2Vzc29yIG1hY3Jvc1xyXG5cdGxldCByZXN1bHQgPSBcIlwiO1xyXG5cdHJlc3VsdCA9IGFwcGVuZExpbmUocmVzdWx0LCB2ZXJzaW9uU3RyaW5nKTtcclxuXHJcblx0aWYgKChudWxsICE9PSBwcmVwcm9jZXNzb3JEZWZpbmVzKSAmJiAodW5kZWZpbmVkICE9PSBwcmVwcm9jZXNzb3JEZWZpbmVzKSlcclxuXHR7XHJcblx0XHRwcmVwcm9jZXNzb3JEZWZpbmVzLmZvckVhY2goXHJcblx0XHRcdGZ1bmN0aW9uIChkZWZpbmUpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyZXN1bHQgPSBhcHBlbmRMaW5lKHJlc3VsdCwgYCNkZWZpbmUgJHtkZWZpbmV9YCk7XHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHJcblx0Ly8gYnVpbGQgdGhlIHNjcmlwdFxyXG5cdHJlc3VsdCA9IGF3YWl0IGJ1aWxkU2NyaXB0KHJlc3VsdCwgZW50cnlTY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgpO1xyXG5cclxuXHRyZXR1cm4gcmVzdWx0LnRyaW0oKTtcclxufVxyXG5cclxuaW50ZXJmYWNlIFNjcmlwdE1hcFxyXG57XHJcblx0W3NjcmlwdEZpbGVQYXRoOiBzdHJpbmddOiBTY3JpcHRJbmZvXHJcbn1cclxuaW50ZXJmYWNlIFByb2Nlc3NlZFNjcmlwdE1hcFxyXG57XHJcblx0W3NjcmlwdEZpbGVQYXRoOiBzdHJpbmddOiBib29sZWFuXHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGJ1aWxkU2NyaXB0KHJlc3VsdDogc3RyaW5nLCBlbnRyeVNjcmlwdDogU2NyaXB0SW5mbywgcmVhZFNjcmlwdDogcmVhZFNjcmlwdCwgcGF0aDogcGF0aCk6IFByb21pc2U8c3RyaW5nPlxyXG57XHJcblx0bGV0IGFsbFNjcmlwdHM6IFNjcmlwdE1hcCA9IHt9O1xyXG5cdGxldCBwcm9jZXNzZWRTY3JpcHRzOiBQcm9jZXNzZWRTY3JpcHRNYXAgPSB7fTtcclxuXHRsZXQgYW5jZXN0b3JzOiBQcm9jZXNzZWRTY3JpcHRNYXAgPSB7fTtcclxuXHJcblx0bGV0IGZ1bGxTY3JpcHQgPSBhd2FpdCBpbnNlcnRTb3J0ZWRJbmNsdWRlcyhlbnRyeVNjcmlwdCwgcmVhZFNjcmlwdCwgcGF0aCwgYW5jZXN0b3JzLCBwcm9jZXNzZWRTY3JpcHRzLCBhbGxTY3JpcHRzKTtcclxuXHJcblx0cmVzdWx0ID0gYXBwZW5kTGluZShyZXN1bHQsIGZ1bGxTY3JpcHQpO1xyXG5cclxuXHRyZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBpbnNlcnRTb3J0ZWRJbmNsdWRlcyhcclxuXHRjdXJyZW50U2NyaXB0OiBTY3JpcHRJbmZvLFxyXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXHJcblx0cGF0aDogcGF0aCxcclxuXHRjdXJyZW50U2NyaXB0QW5jZXN0b3JzOiBQcm9jZXNzZWRTY3JpcHRNYXAsXHJcblx0cHJvY2Vzc2VkU2NyaXB0czogUHJvY2Vzc2VkU2NyaXB0TWFwLFxyXG5cdGFsbFNjcmlwdHM6IFNjcmlwdE1hcCk6IFByb21pc2U8c3RyaW5nPlxyXG57XHJcblx0bGV0IHNjcmlwdEluY2x1ZGVzID0gYXdhaXQgZ2V0U2NyaXB0SW5jbHVkZXMoY3VycmVudFNjcmlwdCwgcmVhZFNjcmlwdCwgcGF0aCwgYWxsU2NyaXB0cyk7XHJcblxyXG5cdGxldCByZXN1bHQgPSBjdXJyZW50U2NyaXB0LnNjcmlwdDtcclxuXHJcblx0bGV0IGluY2x1ZGVNYXRjaE9mZnNldCA9IDA7XHJcblxyXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgc2NyaXB0SW5jbHVkZXMubGVuZ3RoOyBpKyspXHJcblx0e1xyXG5cdFx0bGV0IHNjcmlwdEluY2x1ZGUgPSBzY3JpcHRJbmNsdWRlc1tpXTtcclxuXHJcblx0XHRpZiAoY3VycmVudFNjcmlwdEFuY2VzdG9yc1tzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aF0pXHJcblx0XHR7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkN5Y2xlIGRldGVjdGVkXCIpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHNjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoID09PSBjdXJyZW50U2NyaXB0LnNjcmlwdEZpbGVQYXRoKVxyXG5cdFx0e1xyXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBdHRlbXB0IHRvIGluY2x1ZGUgc2VsZlwiKTtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgYmVmb3JlSW5jbHVkZSA9IHJlc3VsdC5zdWJzdHJpbmcoMCwgaW5jbHVkZU1hdGNoT2Zmc2V0ICsgc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hPZmZzZXQpO1xyXG5cdFx0bGV0IGFmdGVySW5jbHVkZSA9IHJlc3VsdC5zdWJzdHJpbmcoaW5jbHVkZU1hdGNoT2Zmc2V0ICsgc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hPZmZzZXQgKyBzY3JpcHRJbmNsdWRlLmluY2x1ZGVNYXRjaExlbmd0aCk7XHJcblxyXG5cdFx0bGV0IGluY2x1ZGVWYWx1ZTogc3RyaW5nID0gXCJcIjtcclxuXHJcblx0XHRpZiAocHJvY2Vzc2VkU2NyaXB0c1tzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aF0pXHJcblx0XHR7XHJcblx0XHRcdGNvbnNvbGUubG9nKGBTY3JpcHQgJHtzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aH0gYWxyZWFkeSBpbmNsdWRlZGApO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgY2hpbGRBbmNlc3RvcnMgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50U2NyaXB0QW5jZXN0b3JzKTtcclxuXHRcdFx0Y2hpbGRBbmNlc3RvcnNbY3VycmVudFNjcmlwdC5zY3JpcHRGaWxlUGF0aF0gPSB0cnVlO1xyXG5cclxuXHRcdFx0aW5jbHVkZVZhbHVlID0gYXdhaXQgaW5zZXJ0U29ydGVkSW5jbHVkZXMoc2NyaXB0SW5jbHVkZS5zY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgsIGNoaWxkQW5jZXN0b3JzLCBwcm9jZXNzZWRTY3JpcHRzLCBhbGxTY3JpcHRzKTtcclxuXHRcdFx0aW5jbHVkZVZhbHVlID0gc2hhZGVyTmV3TGluZSArIGluY2x1ZGVWYWx1ZSArIHNoYWRlck5ld0xpbmU7XHJcblxyXG5cdFx0XHRwcm9jZXNzZWRTY3JpcHRzW3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoXSA9IHRydWVcclxuXHRcdH1cclxuXHJcblx0XHRyZXN1bHQgPSBiZWZvcmVJbmNsdWRlICsgaW5jbHVkZVZhbHVlICsgYWZ0ZXJJbmNsdWRlO1xyXG5cdFx0aW5jbHVkZU1hdGNoT2Zmc2V0ICs9IChpbmNsdWRlVmFsdWUubGVuZ3RoIC0gc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hMZW5ndGgpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuaW50ZXJmYWNlIEluY2x1ZGVJbmZvXHJcbntcclxuXHRzY3JpcHQ6IFNjcmlwdEluZm87XHJcblx0aW5jbHVkZU1hdGNoT2Zmc2V0OiBudW1iZXI7XHJcblx0aW5jbHVkZU1hdGNoTGVuZ3RoOiBudW1iZXI7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldFNjcmlwdEluY2x1ZGVzKFxyXG5cdHNjcmlwdDogU2NyaXB0SW5mbyxcclxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxyXG5cdHBhdGg6IHBhdGgsXHJcblx0YWxsU2NyaXB0czogU2NyaXB0TWFwKTogUHJvbWlzZTxJbmNsdWRlSW5mb1tdPlxyXG57XHJcblx0bGV0IGluY2x1ZGVzOiBJbmNsdWRlSW5mb1tdID0gW107XHJcblxyXG5cdGlmICgobnVsbCAhPT0gc2NyaXB0KSAmJiAodW5kZWZpbmVkICE9PSBzY3JpcHQpKVxyXG5cdHtcclxuXHRcdGxldCByZWdleCA9IC9eXFwjcHJhZ21hIGluY2x1ZGUgXFxcIiguKilcXFwiJC9nbTtcclxuXHJcblx0XHRsZXQgaW5jbHVkZU1hdGNoID0gcmVnZXguZXhlYyhzY3JpcHQuc2NyaXB0KTtcclxuXHJcblx0XHR3aGlsZSAoaW5jbHVkZU1hdGNoKVxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgcmVsYXRpdmVJbmNsdWRlRmlsZVBhdGggPSBpbmNsdWRlTWF0Y2hbMV07XHJcblxyXG5cdFx0XHRsZXQgaW5jbHVkZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKHNjcmlwdC5zY3JpcHRGb2xkZXJQYXRoLCByZWxhdGl2ZUluY2x1ZGVGaWxlUGF0aCk7XHJcblx0XHRcdGxldCBpbmNsdWRlRm9sZGVyUGF0aCA9IHBhdGguZGlybmFtZShpbmNsdWRlRmlsZVBhdGgpO1xyXG5cdFx0XHRsZXQgaW5jbHVkZUZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShpbmNsdWRlRmlsZVBhdGgpO1xyXG5cclxuXHRcdFx0bGV0IGluY2x1ZGVTY3JpcHQgPSBhbGxTY3JpcHRzW2luY2x1ZGVGaWxlUGF0aF07XHJcblxyXG5cdFx0XHRpZiAoKG51bGwgPT09IGluY2x1ZGVTY3JpcHQpIHx8ICh1bmRlZmluZWQgPT09IGluY2x1ZGVTY3JpcHQpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0aW5jbHVkZVNjcmlwdCA9XHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdHNjcmlwdDogYXdhaXQgcmVhZFNoYWRlclNjcmlwdChpbmNsdWRlRmlsZVBhdGgsIHJlYWRTY3JpcHQpLFxyXG5cdFx0XHRcdFx0XHRzY3JpcHRGaWxlUGF0aDogaW5jbHVkZUZpbGVQYXRoLFxyXG5cdFx0XHRcdFx0XHRzY3JpcHRGb2xkZXJQYXRoOiBpbmNsdWRlRm9sZGVyUGF0aCxcclxuXHRcdFx0XHRcdFx0c2NyaXB0RmlsZU5hbWU6IGluY2x1ZGVGaWxlTmFtZVxyXG5cdFx0XHRcdFx0fTtcclxuXHRcdFx0XHRhbGxTY3JpcHRzW2luY2x1ZGVGaWxlUGF0aF0gPSBpbmNsdWRlU2NyaXB0O1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgaW5jbHVkZUluZm86IEluY2x1ZGVJbmZvID1cclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRzY3JpcHQ6IGluY2x1ZGVTY3JpcHQsXHJcblx0XHRcdFx0XHRpbmNsdWRlTWF0Y2hPZmZzZXQ6IGluY2x1ZGVNYXRjaC5pbmRleCxcclxuXHRcdFx0XHRcdGluY2x1ZGVNYXRjaExlbmd0aDogaW5jbHVkZU1hdGNoWzBdLmxlbmd0aFxyXG5cdFx0XHRcdH07XHJcblxyXG5cdFx0XHRpbmNsdWRlcy5wdXNoKGluY2x1ZGVJbmZvKTtcclxuXHJcblx0XHRcdGluY2x1ZGVNYXRjaCA9IHJlZ2V4LmV4ZWMoc2NyaXB0LnNjcmlwdCk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gaW5jbHVkZXM7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlYWRTaGFkZXJTY3JpcHQocGF0aDogc3RyaW5nLCByZWFkU2NyaXB0OiByZWFkU2NyaXB0KTogUHJvbWlzZTxzdHJpbmc+XHJcbntcclxuXHRsZXQgc2NyaXB0ID0gYXdhaXQgcmVhZFNjcmlwdChwYXRoKTtcclxuXHRyZXR1cm4gZml4TGluZUVuZGluZ3Moc2NyaXB0KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZml4TGluZUVuZGluZ3Moc291cmNlOiBzdHJpbmcpXHJcbntcclxuXHRyZXR1cm4gc291cmNlLnJlcGxhY2UoXCJcXHJcXG5cIiwgc2hhZGVyTmV3TGluZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFwcGVuZExpbmUoY3VycmVudFZhbHVlOiBzdHJpbmcsIGxpbmVUb0FwcGVuZDogc3RyaW5nKTogc3RyaW5nXHJcbntcclxuXHRpZiAoKG51bGwgPT09IGxpbmVUb0FwcGVuZCkgfHwgKHVuZGVmaW5lZCA9PT0gbGluZVRvQXBwZW5kKSlcclxuXHR7XHJcblx0XHRyZXR1cm4gY3VycmVudFZhbHVlO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGN1cnJlbnRWYWx1ZSArIGxpbmVUb0FwcGVuZCArIHNoYWRlck5ld0xpbmU7XHJcbn1cclxuIl19