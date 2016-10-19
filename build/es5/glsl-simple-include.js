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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xzbC1zaW1wbGUtaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nbHNsLXNpbXBsZS1pbmNsdWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFTQSxJQUFNLEFBQWEsZ0JBQUcsQUFBSSxBQUFDO0FBRTNCLHlCQUNDLEFBQXNCLFlBQ3RCLEFBQVUsTUFDVixBQUF1QixpQkFDdkIsQUFBb0IsYUFDcEIsQUFBOEI7O0FBRTlCOzs7OztBQUFJLEFBQWEsd0NBQUcsQUFBSSxLQUFDLEFBQU8sUUFBQyxBQUFlLEFBQUMsQUFBQyxBQUNsRDtBQUFJLEFBQWUsMENBQUcsQUFBSSxLQUFDLEFBQU8sUUFBQyxBQUFhLEFBQUMsQUFBQyxBQUNsRDtBQUFJLEFBQWEsd0NBQUcsQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFhLEFBQUMsQUFBQyxBQUVqRCxBQUFFLEFBQUM7OzhCQUFFLEFBQUksU0FBSyxBQUFXLEFBQUMsQUFBSSxXQUExQixJQUEyQixBQUFTLGNBQUssQUFBVyxBQUFDLEFBQUMsQUFDMUQsQUFBQzs7Ozs7OytCQUNvQixBQUFnQixpQkFBQyxBQUFhLGVBQUUsQUFBVSxBQUFDLEFBQUMsQUFDakUsQUFBQyxBQUNELEFBQUksQUFDSixBQUFDOzs7QUFIQSxBQUFXLEFBQUc7Ozs7O0FBSWQsQUFBVyxzQ0FBRyxBQUFjLGVBQUMsQUFBVyxBQUFDLEFBQUMsQUFDM0MsQUFBQyxBQUVELEFBQU0sQUFBQzs7Ozs7QUFFTCxBQUFNLG9DQUFFLEFBQVc7QUFDbkIsQUFBYyw0Q0FBRSxBQUFhO0FBQzdCLEFBQWdCLDhDQUFFLEFBQWU7QUFDakMsQUFBYyw0Q0FBRSxBQUFhLEFBQzdCO0FBTEQseUJBRFksQUFBYSxFQU96QixBQUFVLFlBQ1YsQUFBSSxNQUNKLEFBQW1CLEFBQUMsQUFBQyxBQUN2QixBQUFDOzs7Ozs7Ozs7Ozs7O0FBOUJxQixRQUFlLGtC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QixBQUFvQixjQUFFLEFBQW9CO0FBRTdELEFBQUUsQUFBQyxRQUFFLEFBQUksU0FBSyxBQUFZLEFBQUMsQUFBSSxZQUEzQixJQUE0QixBQUFTLGNBQUssQUFBWSxBQUFDLEFBQUMsY0FDNUQsQUFBQztBQUNBLEFBQU0sZUFBQyxBQUFZLEFBQUMsQUFDckI7QUFBQztBQUVELEFBQU0sV0FBQyxBQUFZLGVBQUcsQUFBWSxlQUFHLEFBQWEsQUFBQyxBQUNwRDtBQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHR5cGUgcmVhZFNjcmlwdCA9IChwYXRoOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nPjtcblxuZXhwb3J0IGludGVyZmFjZSBwYXRoXG57XG5cdHJlc29sdmUoLi4ucGF0aDogc3RyaW5nW10pOiBzdHJpbmc7XG5cdGRpcm5hbWUocGF0aDogc3RyaW5nKTogc3RyaW5nO1xuXHRiYXNlbmFtZShwYXRoOiBzdHJpbmcsIGV4dD86IHN0cmluZyk6IHN0cmluZztcbn1cblxuY29uc3Qgc2hhZGVyTmV3TGluZSA9IFwiXFxuXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9jZXNzSW5jbHVkZXMoXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXG5cdHBhdGg6IHBhdGgsXG5cdGVudHJ5U2NyaXB0UGF0aDogc3RyaW5nLFxuXHRlbnRyeVNjcmlwdD86IHN0cmluZyxcblx0cHJlcHJvY2Vzc29yRGVmaW5lcz86IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBlbnRyeUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGVudHJ5U2NyaXB0UGF0aCk7XG5cdGxldCBlbnRyeUZvbGRlclBhdGggPSBwYXRoLmRpcm5hbWUoZW50cnlGaWxlUGF0aCk7XG5cdGxldCBlbnRyeUZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShlbnRyeUZpbGVQYXRoKTtcblxuXHRpZiAoKG51bGwgPT09IGVudHJ5U2NyaXB0KSB8fCAodW5kZWZpbmVkID09PSBlbnRyeVNjcmlwdCkpXG5cdHtcblx0XHRlbnRyeVNjcmlwdCA9IGF3YWl0IHJlYWRTaGFkZXJTY3JpcHQoZW50cnlGaWxlUGF0aCwgcmVhZFNjcmlwdCk7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0ZW50cnlTY3JpcHQgPSBmaXhMaW5lRW5kaW5ncyhlbnRyeVNjcmlwdCk7XG5cdH1cblxuXHRyZXR1cm4gYXdhaXQgcHJvY2Vzc1NjcmlwdChcblx0XHR7XG5cdFx0XHRzY3JpcHQ6IGVudHJ5U2NyaXB0LFxuXHRcdFx0c2NyaXB0RmlsZVBhdGg6IGVudHJ5RmlsZVBhdGgsXG5cdFx0XHRzY3JpcHRGb2xkZXJQYXRoOiBlbnRyeUZvbGRlclBhdGgsXG5cdFx0XHRzY3JpcHRGaWxlTmFtZTogZW50cnlGaWxlTmFtZVxuXHRcdH0sXG5cdFx0cmVhZFNjcmlwdCxcblx0XHRwYXRoLFxuXHRcdHByZXByb2Nlc3NvckRlZmluZXMpO1xufVxuXG5pbnRlcmZhY2UgU2NyaXB0SW5mb1xue1xuXHRzY3JpcHQ6IHN0cmluZztcblx0c2NyaXB0RmlsZVBhdGg6IHN0cmluZztcblx0c2NyaXB0Rm9sZGVyUGF0aDogc3RyaW5nO1xuXHRzY3JpcHRGaWxlTmFtZTogc3RyaW5nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzU2NyaXB0KFxuXHRlbnRyeVNjcmlwdDogU2NyaXB0SW5mbyxcblx0cmVhZFNjcmlwdDogcmVhZFNjcmlwdCxcblx0cGF0aDogcGF0aCxcblx0cHJlcHJvY2Vzc29yRGVmaW5lcz86IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdC8vIHN0cmlwIHZlcnNpb25cblx0bGV0IHZlcnNpb25TdHJpbmc6IHN0cmluZyA9IG51bGw7XG5cblx0bGV0IHZlcnNpb25SZWdleCA9IC9eXFxzKiN2ZXJzaW9uIC4qJC9tO1xuXHRsZXQgdmVyc2lvbk1hdGNoID0gdmVyc2lvblJlZ2V4LmV4ZWMoZW50cnlTY3JpcHQuc2NyaXB0KTtcblxuXHRpZiAoKG51bGwgIT09IHZlcnNpb25NYXRjaCkgJiYgKHVuZGVmaW5lZCAhPT0gdmVyc2lvbk1hdGNoKSlcblx0e1xuXHRcdGxldCBhZnRlclZlcnNpb25JbmRleCA9IHZlcnNpb25NYXRjaC5pbmRleCArIHZlcnNpb25NYXRjaFswXS5sZW5ndGg7XG5cblx0XHR2ZXJzaW9uU3RyaW5nID0gdmVyc2lvbk1hdGNoWzBdLnRyaW0oKTtcblx0XHRlbnRyeVNjcmlwdC5zY3JpcHQgPSBlbnRyeVNjcmlwdC5zY3JpcHQuc3Vic3RyKGFmdGVyVmVyc2lvbkluZGV4KTtcblx0fVxuXG5cdC8vIGFwcGVuZCB2ZXJzaW9uIGFuZCBwcmVwcm9jZXNzb3IgbWFjcm9zXG5cdGxldCByZXN1bHQgPSBcIlwiO1xuXHRyZXN1bHQgPSBhcHBlbmRMaW5lKHJlc3VsdCwgdmVyc2lvblN0cmluZyk7XG5cblx0aWYgKChudWxsICE9PSBwcmVwcm9jZXNzb3JEZWZpbmVzKSAmJiAodW5kZWZpbmVkICE9PSBwcmVwcm9jZXNzb3JEZWZpbmVzKSlcblx0e1xuXHRcdHByZXByb2Nlc3NvckRlZmluZXMuZm9yRWFjaChcblx0XHRcdGZ1bmN0aW9uIChkZWZpbmUpXG5cdFx0XHR7XG5cdFx0XHRcdHJlc3VsdCA9IGFwcGVuZExpbmUocmVzdWx0LCBgI2RlZmluZSAke2RlZmluZX1gKTtcblx0XHRcdH0pO1xuXHR9XG5cblx0Ly8gYnVpbGQgdGhlIHNjcmlwdFxuXHRyZXN1bHQgPSBhd2FpdCBidWlsZFNjcmlwdChyZXN1bHQsIGVudHJ5U2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoKTtcblxuXHRyZXR1cm4gcmVzdWx0LnRyaW0oKTtcbn1cblxuaW50ZXJmYWNlIFNjcmlwdE1hcFxue1xuXHRbc2NyaXB0RmlsZVBhdGg6IHN0cmluZ106IFNjcmlwdEluZm9cbn1cbmludGVyZmFjZSBQcm9jZXNzZWRTY3JpcHRNYXBcbntcblx0W3NjcmlwdEZpbGVQYXRoOiBzdHJpbmddOiBib29sZWFuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGJ1aWxkU2NyaXB0KHJlc3VsdDogc3RyaW5nLCBlbnRyeVNjcmlwdDogU2NyaXB0SW5mbywgcmVhZFNjcmlwdDogcmVhZFNjcmlwdCwgcGF0aDogcGF0aCk6IFByb21pc2U8c3RyaW5nPlxue1xuXHRsZXQgYWxsU2NyaXB0czogU2NyaXB0TWFwID0ge307XG5cdGxldCBwcm9jZXNzZWRTY3JpcHRzOiBQcm9jZXNzZWRTY3JpcHRNYXAgPSB7fTtcblx0bGV0IGFuY2VzdG9yczogUHJvY2Vzc2VkU2NyaXB0TWFwID0ge307XG5cblx0bGV0IGZ1bGxTY3JpcHQgPSBhd2FpdCBpbnNlcnRTb3J0ZWRJbmNsdWRlcyhlbnRyeVNjcmlwdCwgcmVhZFNjcmlwdCwgcGF0aCwgYW5jZXN0b3JzLCBwcm9jZXNzZWRTY3JpcHRzLCBhbGxTY3JpcHRzKTtcblxuXHRyZXN1bHQgPSBhcHBlbmRMaW5lKHJlc3VsdCwgZnVsbFNjcmlwdCk7XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5zZXJ0U29ydGVkSW5jbHVkZXMoXG5cdGN1cnJlbnRTY3JpcHQ6IFNjcmlwdEluZm8sXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXG5cdHBhdGg6IHBhdGgsXG5cdGN1cnJlbnRTY3JpcHRBbmNlc3RvcnM6IFByb2Nlc3NlZFNjcmlwdE1hcCxcblx0cHJvY2Vzc2VkU2NyaXB0czogUHJvY2Vzc2VkU2NyaXB0TWFwLFxuXHRhbGxTY3JpcHRzOiBTY3JpcHRNYXApOiBQcm9taXNlPHN0cmluZz5cbntcblx0bGV0IHNjcmlwdEluY2x1ZGVzID0gYXdhaXQgZ2V0U2NyaXB0SW5jbHVkZXMoY3VycmVudFNjcmlwdCwgcmVhZFNjcmlwdCwgcGF0aCwgYWxsU2NyaXB0cyk7XG5cblx0bGV0IHJlc3VsdCA9IGN1cnJlbnRTY3JpcHQuc2NyaXB0O1xuXG5cdGxldCBpbmNsdWRlTWF0Y2hPZmZzZXQgPSAwO1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgc2NyaXB0SW5jbHVkZXMubGVuZ3RoOyBpKyspXG5cdHtcblx0XHRsZXQgc2NyaXB0SW5jbHVkZSA9IHNjcmlwdEluY2x1ZGVzW2ldO1xuXG5cdFx0aWYgKGN1cnJlbnRTY3JpcHRBbmNlc3RvcnNbc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGhdKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkN5Y2xlIGRldGVjdGVkXCIpO1xuXHRcdH1cblx0XHRpZiAoc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGggPT09IGN1cnJlbnRTY3JpcHQuc2NyaXB0RmlsZVBhdGgpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQXR0ZW1wdCB0byBpbmNsdWRlIHNlbGZcIik7XG5cdFx0fVxuXG5cdFx0bGV0IGJlZm9yZUluY2x1ZGUgPSByZXN1bHQuc3Vic3RyaW5nKDAsIGluY2x1ZGVNYXRjaE9mZnNldCArIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoT2Zmc2V0KTtcblx0XHRsZXQgYWZ0ZXJJbmNsdWRlID0gcmVzdWx0LnN1YnN0cmluZyhpbmNsdWRlTWF0Y2hPZmZzZXQgKyBzY3JpcHRJbmNsdWRlLmluY2x1ZGVNYXRjaE9mZnNldCArIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoTGVuZ3RoKTtcblxuXHRcdGxldCBpbmNsdWRlVmFsdWU6IHN0cmluZyA9IFwiXCI7XG5cblx0XHRpZiAocHJvY2Vzc2VkU2NyaXB0c1tzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aF0pXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coYFNjcmlwdCAke3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRofSBhbHJlYWR5IGluY2x1ZGVkYCk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRsZXQgY2hpbGRBbmNlc3RvcnMgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50U2NyaXB0QW5jZXN0b3JzKTtcblx0XHRcdGNoaWxkQW5jZXN0b3JzW2N1cnJlbnRTY3JpcHQuc2NyaXB0RmlsZVBhdGhdID0gdHJ1ZTtcblxuXHRcdFx0aW5jbHVkZVZhbHVlID0gYXdhaXQgaW5zZXJ0U29ydGVkSW5jbHVkZXMoc2NyaXB0SW5jbHVkZS5zY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgsIGNoaWxkQW5jZXN0b3JzLCBwcm9jZXNzZWRTY3JpcHRzLCBhbGxTY3JpcHRzKTtcblx0XHRcdGluY2x1ZGVWYWx1ZSA9IHNoYWRlck5ld0xpbmUgKyBpbmNsdWRlVmFsdWUgKyBzaGFkZXJOZXdMaW5lO1xuXG5cdFx0XHRwcm9jZXNzZWRTY3JpcHRzW3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoXSA9IHRydWVcblx0XHR9XG5cblx0XHRyZXN1bHQgPSBiZWZvcmVJbmNsdWRlICsgaW5jbHVkZVZhbHVlICsgYWZ0ZXJJbmNsdWRlO1xuXHRcdGluY2x1ZGVNYXRjaE9mZnNldCArPSAoaW5jbHVkZVZhbHVlLmxlbmd0aCAtIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoTGVuZ3RoKTtcblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmludGVyZmFjZSBJbmNsdWRlSW5mb1xue1xuXHRzY3JpcHQ6IFNjcmlwdEluZm87XG5cdGluY2x1ZGVNYXRjaE9mZnNldDogbnVtYmVyO1xuXHRpbmNsdWRlTWF0Y2hMZW5ndGg6IG51bWJlcjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U2NyaXB0SW5jbHVkZXMoXG5cdHNjcmlwdDogU2NyaXB0SW5mbyxcblx0cmVhZFNjcmlwdDogcmVhZFNjcmlwdCxcblx0cGF0aDogcGF0aCxcblx0YWxsU2NyaXB0czogU2NyaXB0TWFwKTogUHJvbWlzZTxJbmNsdWRlSW5mb1tdPlxue1xuXHRsZXQgaW5jbHVkZXM6IEluY2x1ZGVJbmZvW10gPSBbXTtcblxuXHRpZiAoKG51bGwgIT09IHNjcmlwdCkgJiYgKHVuZGVmaW5lZCAhPT0gc2NyaXB0KSlcblx0e1xuXHRcdGxldCByZWdleCA9IC9eXFwjcHJhZ21hIGluY2x1ZGUgXFxcIiguKilcXFwiJC9nbTtcblxuXHRcdGxldCBpbmNsdWRlTWF0Y2ggPSByZWdleC5leGVjKHNjcmlwdC5zY3JpcHQpO1xuXG5cdFx0d2hpbGUgKGluY2x1ZGVNYXRjaClcblx0XHR7XG5cdFx0XHRsZXQgcmVsYXRpdmVJbmNsdWRlRmlsZVBhdGggPSBpbmNsdWRlTWF0Y2hbMV07XG5cblx0XHRcdGxldCBpbmNsdWRlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoc2NyaXB0LnNjcmlwdEZvbGRlclBhdGgsIHJlbGF0aXZlSW5jbHVkZUZpbGVQYXRoKTtcblx0XHRcdGxldCBpbmNsdWRlRm9sZGVyUGF0aCA9IHBhdGguZGlybmFtZShpbmNsdWRlRmlsZVBhdGgpO1xuXHRcdFx0bGV0IGluY2x1ZGVGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoaW5jbHVkZUZpbGVQYXRoKTtcblxuXHRcdFx0bGV0IGluY2x1ZGVTY3JpcHQgPSBhbGxTY3JpcHRzW2luY2x1ZGVGaWxlUGF0aF07XG5cblx0XHRcdGlmICgobnVsbCA9PT0gaW5jbHVkZVNjcmlwdCkgfHwgKHVuZGVmaW5lZCA9PT0gaW5jbHVkZVNjcmlwdCkpXG5cdFx0XHR7XG5cdFx0XHRcdGluY2x1ZGVTY3JpcHQgPVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNjcmlwdDogYXdhaXQgcmVhZFNoYWRlclNjcmlwdChpbmNsdWRlRmlsZVBhdGgsIHJlYWRTY3JpcHQpLFxuXHRcdFx0XHRcdFx0c2NyaXB0RmlsZVBhdGg6IGluY2x1ZGVGaWxlUGF0aCxcblx0XHRcdFx0XHRcdHNjcmlwdEZvbGRlclBhdGg6IGluY2x1ZGVGb2xkZXJQYXRoLFxuXHRcdFx0XHRcdFx0c2NyaXB0RmlsZU5hbWU6IGluY2x1ZGVGaWxlTmFtZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGFsbFNjcmlwdHNbaW5jbHVkZUZpbGVQYXRoXSA9IGluY2x1ZGVTY3JpcHQ7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBpbmNsdWRlSW5mbzogSW5jbHVkZUluZm8gPVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2NyaXB0OiBpbmNsdWRlU2NyaXB0LFxuXHRcdFx0XHRcdGluY2x1ZGVNYXRjaE9mZnNldDogaW5jbHVkZU1hdGNoLmluZGV4LFxuXHRcdFx0XHRcdGluY2x1ZGVNYXRjaExlbmd0aDogaW5jbHVkZU1hdGNoWzBdLmxlbmd0aFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRpbmNsdWRlcy5wdXNoKGluY2x1ZGVJbmZvKTtcblxuXHRcdFx0aW5jbHVkZU1hdGNoID0gcmVnZXguZXhlYyhzY3JpcHQuc2NyaXB0KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gaW5jbHVkZXM7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlYWRTaGFkZXJTY3JpcHQocGF0aDogc3RyaW5nLCByZWFkU2NyaXB0OiByZWFkU2NyaXB0KTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBzY3JpcHQgPSBhd2FpdCByZWFkU2NyaXB0KHBhdGgpO1xuXHRyZXR1cm4gZml4TGluZUVuZGluZ3Moc2NyaXB0KTtcbn1cblxuZnVuY3Rpb24gZml4TGluZUVuZGluZ3Moc291cmNlOiBzdHJpbmcpXG57XG5cdHJldHVybiBzb3VyY2UucmVwbGFjZShcIlxcclxcblwiLCBzaGFkZXJOZXdMaW5lKTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kTGluZShjdXJyZW50VmFsdWU6IHN0cmluZywgbGluZVRvQXBwZW5kOiBzdHJpbmcpOiBzdHJpbmdcbntcblx0aWYgKChudWxsID09PSBsaW5lVG9BcHBlbmQpIHx8ICh1bmRlZmluZWQgPT09IGxpbmVUb0FwcGVuZCkpXG5cdHtcblx0XHRyZXR1cm4gY3VycmVudFZhbHVlO1xuXHR9XG5cblx0cmV0dXJuIGN1cnJlbnRWYWx1ZSArIGxpbmVUb0FwcGVuZCArIHNoYWRlck5ld0xpbmU7XG59XG4iXX0=