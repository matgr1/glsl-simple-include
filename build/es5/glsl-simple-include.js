"use strict";

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
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
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
        var entryFilePath, entryFolderPath, entryFileName;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        entryFilePath = path.resolve(entryScriptPath);
                        entryFolderPath = path.dirname(entryFilePath);
                        entryFileName = path.basename(entryFilePath);

                        if (!(null === entryScript || undefined === entryScript)) {
                            _context.next = 7;
                            break;
                        }

                        _context.next = 6;
                        return readShaderScript(entryFilePath, readScript);

                    case 6:
                        entryScript = _context.sent;

                    case 7:
                        _context.next = 9;
                        return processScript({
                            script: entryScript,
                            scriptFilePath: entryFilePath,
                            scriptFolderPath: entryFolderPath,
                            scriptFileName: entryFileName
                        }, readScript, path, preprocessorDefines);

                    case 9:
                        return _context.abrupt("return", _context.sent);

                    case 10:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));
}
exports.processIncludes = processIncludes;
function processScript(entryScript, readScript, path, preprocessorDefines) {
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
        var versionString, versionRegex, versionMatch, afterVersionIndex, result;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
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
                        return _context2.abrupt("return", stripBom(result).trim());

                    case 11:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));
}
function buildScript(result, entryScript, readScript, path) {
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
        var allScripts, processedScripts, ancestors, fullScript;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
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
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee4() {
        var scriptIncludes, result, includeMatchOffset, i, scriptInclude, beforeInclude, afterInclude, includeValue, childAncestors;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
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
                        childAncestors = Object.assign({}, currentScriptAncestors);

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
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee5() {
        var includes, regex, includeMatch, relativeIncludeFilePath, includeFilePath, includeFolderPath, includeFileName, includeScript, includeInfo;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
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
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee6() {
        var script;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xzbC1zaW1wbGUtaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nbHNsLXNpbXBsZS1pbmNsdWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBSSxBQUFRLFdBQUcsQUFBTyxRQUFDLEFBQVcsQUFBQyxBQUFDO0FBV3BDLElBQU0sQUFBYSxnQkFBRyxBQUFJLEFBQUM7QUFFM0IseUJBQ0MsQUFBc0IsWUFDdEIsQUFBVSxNQUNWLEFBQXVCLGlCQUN2QixBQUFvQixhQUNwQixBQUE4Qjs7QUFFOUI7Ozs7O0FBQUksQUFBYSx3Q0FBRyxBQUFJLEtBQUMsQUFBTyxRQUFDLEFBQWUsQUFBQyxBQUFDLEFBQ2xEO0FBQUksQUFBZSwwQ0FBRyxBQUFJLEtBQUMsQUFBTyxRQUFDLEFBQWEsQUFBQyxBQUFDLEFBQ2xEO0FBQUksQUFBYSx3Q0FBRyxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQWEsQUFBQyxBQUFDLEFBRWpELEFBQUUsQUFBQzs7OEJBQUUsQUFBSSxTQUFLLEFBQVcsQUFBQyxBQUFJLFdBQTFCLElBQTJCLEFBQVMsY0FBSyxBQUFXLEFBQUMsQUFBQyxBQUMxRCxBQUFDOzs7Ozs7K0JBQ29CLEFBQWdCLGlCQUFDLEFBQWEsZUFBRSxBQUFVLEFBQUMsQUFBQyxBQUNqRSxBQUFDLEFBRUQsQUFBTSxBQUFDOzs7QUFITixBQUFXLEFBQUc7Ozs7O0FBS2IsQUFBTSxvQ0FBRSxBQUFXO0FBQ25CLEFBQWMsNENBQUUsQUFBYTtBQUM3QixBQUFnQiw4Q0FBRSxBQUFlO0FBQ2pDLEFBQWMsNENBQUUsQUFBYSxBQUM3QjtBQUxELHlCQURZLEFBQWEsRUFPekIsQUFBVSxZQUNWLEFBQUksTUFDSixBQUFtQixBQUFDLEFBQUMsQUFDdkIsQUFBQzs7Ozs7Ozs7Ozs7OztBQTFCcUIsUUFBZSxrQkEwQnBDO0FBVUQsdUJBQ0MsQUFBdUIsYUFDdkIsQUFBc0IsWUFDdEIsQUFB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QUFBQyxRQUFFLEFBQUksU0FBSyxBQUFZLEFBQUMsQUFBSSxZQUEzQixJQUE0QixBQUFTLGNBQUssQUFBWSxBQUFDLEFBQUMsY0FDNUQsQUFBQztBQUNBLEFBQU0sZUFBQyxBQUFZLEFBQUMsQUFDckI7QUFBQztBQUVELEFBQU0sV0FBQyxBQUFZLGVBQUcsQUFBWSxlQUFHLEFBQWEsQUFBQyxBQUNwRDtBQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZGVjbGFyZSBsZXQgcmVxdWlyZTogYW55O1xubGV0IHN0cmlwQm9tID0gcmVxdWlyZShcInN0cmlwLWJvbVwiKTtcblxuZXhwb3J0IHR5cGUgcmVhZFNjcmlwdCA9IChwYXRoOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nPjtcblxuZXhwb3J0IGludGVyZmFjZSBwYXRoXG57XG5cdHJlc29sdmUoLi4ucGF0aDogc3RyaW5nW10pOiBzdHJpbmc7XG5cdGRpcm5hbWUocGF0aDogc3RyaW5nKTogc3RyaW5nO1xuXHRiYXNlbmFtZShwYXRoOiBzdHJpbmcsIGV4dD86IHN0cmluZyk6IHN0cmluZztcbn1cblxuY29uc3Qgc2hhZGVyTmV3TGluZSA9IFwiXFxuXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9jZXNzSW5jbHVkZXMoXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXG5cdHBhdGg6IHBhdGgsXG5cdGVudHJ5U2NyaXB0UGF0aDogc3RyaW5nLFxuXHRlbnRyeVNjcmlwdD86IHN0cmluZyxcblx0cHJlcHJvY2Vzc29yRGVmaW5lcz86IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBlbnRyeUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGVudHJ5U2NyaXB0UGF0aCk7XG5cdGxldCBlbnRyeUZvbGRlclBhdGggPSBwYXRoLmRpcm5hbWUoZW50cnlGaWxlUGF0aCk7XG5cdGxldCBlbnRyeUZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShlbnRyeUZpbGVQYXRoKTtcblxuXHRpZiAoKG51bGwgPT09IGVudHJ5U2NyaXB0KSB8fCAodW5kZWZpbmVkID09PSBlbnRyeVNjcmlwdCkpXG5cdHtcblx0XHRlbnRyeVNjcmlwdCA9IGF3YWl0IHJlYWRTaGFkZXJTY3JpcHQoZW50cnlGaWxlUGF0aCwgcmVhZFNjcmlwdCk7XG5cdH1cblxuXHRyZXR1cm4gYXdhaXQgcHJvY2Vzc1NjcmlwdChcblx0XHR7XG5cdFx0XHRzY3JpcHQ6IGVudHJ5U2NyaXB0LFxuXHRcdFx0c2NyaXB0RmlsZVBhdGg6IGVudHJ5RmlsZVBhdGgsXG5cdFx0XHRzY3JpcHRGb2xkZXJQYXRoOiBlbnRyeUZvbGRlclBhdGgsXG5cdFx0XHRzY3JpcHRGaWxlTmFtZTogZW50cnlGaWxlTmFtZVxuXHRcdH0sXG5cdFx0cmVhZFNjcmlwdCxcblx0XHRwYXRoLFxuXHRcdHByZXByb2Nlc3NvckRlZmluZXMpO1xufVxuXG5pbnRlcmZhY2UgU2NyaXB0SW5mb1xue1xuXHRzY3JpcHQ6IHN0cmluZztcblx0c2NyaXB0RmlsZVBhdGg6IHN0cmluZztcblx0c2NyaXB0Rm9sZGVyUGF0aDogc3RyaW5nO1xuXHRzY3JpcHRGaWxlTmFtZTogc3RyaW5nO1xufVxuXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzU2NyaXB0KFxuXHRlbnRyeVNjcmlwdDogU2NyaXB0SW5mbyxcblx0cmVhZFNjcmlwdDogcmVhZFNjcmlwdCxcblx0cGF0aDogcGF0aCxcblx0cHJlcHJvY2Vzc29yRGVmaW5lcz86IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdC8vIHN0cmlwIHZlcnNpb25cblx0bGV0IHZlcnNpb25TdHJpbmc6IHN0cmluZyA9IG51bGw7XG5cblx0bGV0IHZlcnNpb25SZWdleCA9IC9eXFxzKiN2ZXJzaW9uIC4qJC9tO1xuXHRsZXQgdmVyc2lvbk1hdGNoID0gdmVyc2lvblJlZ2V4LmV4ZWMoZW50cnlTY3JpcHQuc2NyaXB0KTtcblxuXHRpZiAoKG51bGwgIT09IHZlcnNpb25NYXRjaCkgJiYgKHVuZGVmaW5lZCAhPT0gdmVyc2lvbk1hdGNoKSlcblx0e1xuXHRcdGxldCBhZnRlclZlcnNpb25JbmRleCA9IHZlcnNpb25NYXRjaC5pbmRleCArIHZlcnNpb25NYXRjaFswXS5sZW5ndGg7XG5cblx0XHR2ZXJzaW9uU3RyaW5nID0gdmVyc2lvbk1hdGNoWzBdLnRyaW0oKTtcblx0XHRlbnRyeVNjcmlwdC5zY3JpcHQgPSBlbnRyeVNjcmlwdC5zY3JpcHQuc3Vic3RyKGFmdGVyVmVyc2lvbkluZGV4KTtcblx0fVxuXG5cdC8vIGFwcGVuZCB2ZXJzaW9uIGFuZCBwcmVwcm9jZXNzb3IgbWFjcm9zXG5cdGxldCByZXN1bHQgPSBcIlwiO1xuXHRyZXN1bHQgPSBhcHBlbmRMaW5lKHJlc3VsdCwgdmVyc2lvblN0cmluZyk7XG5cblx0aWYgKChudWxsICE9PSBwcmVwcm9jZXNzb3JEZWZpbmVzKSAmJiAodW5kZWZpbmVkICE9PSBwcmVwcm9jZXNzb3JEZWZpbmVzKSlcblx0e1xuXHRcdHByZXByb2Nlc3NvckRlZmluZXMuZm9yRWFjaChcblx0XHRcdGZ1bmN0aW9uIChkZWZpbmUpXG5cdFx0XHR7XG5cdFx0XHRcdHJlc3VsdCA9IGFwcGVuZExpbmUocmVzdWx0LCBgI2RlZmluZSAke2RlZmluZX1gKTtcblx0XHRcdH0pO1xuXHR9XG5cblx0Ly8gYnVpbGQgdGhlIHNjcmlwdFxuXHRyZXN1bHQgPSBhd2FpdCBidWlsZFNjcmlwdChyZXN1bHQsIGVudHJ5U2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoKTtcblxuXHRyZXR1cm4gc3RyaXBCb20ocmVzdWx0KS50cmltKCk7XG59XG5cbmludGVyZmFjZSBTY3JpcHRNYXBcbntcblx0W3NjcmlwdEZpbGVQYXRoOiBzdHJpbmddOiBTY3JpcHRJbmZvXG59XG5pbnRlcmZhY2UgUHJvY2Vzc2VkU2NyaXB0TWFwXG57XG5cdFtzY3JpcHRGaWxlUGF0aDogc3RyaW5nXTogYm9vbGVhblxufVxuXG5hc3luYyBmdW5jdGlvbiBidWlsZFNjcmlwdChyZXN1bHQ6IHN0cmluZywgZW50cnlTY3JpcHQ6IFNjcmlwdEluZm8sIHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsIHBhdGg6IHBhdGgpOiBQcm9taXNlPHN0cmluZz5cbntcblx0bGV0IGFsbFNjcmlwdHM6IFNjcmlwdE1hcCA9IHt9O1xuXHRsZXQgcHJvY2Vzc2VkU2NyaXB0czogUHJvY2Vzc2VkU2NyaXB0TWFwID0ge307XG5cdGxldCBhbmNlc3RvcnM6IFByb2Nlc3NlZFNjcmlwdE1hcCA9IHt9O1xuXG5cdGxldCBmdWxsU2NyaXB0ID0gYXdhaXQgaW5zZXJ0U29ydGVkSW5jbHVkZXMoZW50cnlTY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgsIGFuY2VzdG9ycywgcHJvY2Vzc2VkU2NyaXB0cywgYWxsU2NyaXB0cyk7XG5cblx0cmVzdWx0ID0gYXBwZW5kTGluZShyZXN1bHQsIGZ1bGxTY3JpcHQpO1xuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluc2VydFNvcnRlZEluY2x1ZGVzKFxuXHRjdXJyZW50U2NyaXB0OiBTY3JpcHRJbmZvLFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRjdXJyZW50U2NyaXB0QW5jZXN0b3JzOiBQcm9jZXNzZWRTY3JpcHRNYXAsXG5cdHByb2Nlc3NlZFNjcmlwdHM6IFByb2Nlc3NlZFNjcmlwdE1hcCxcblx0YWxsU2NyaXB0czogU2NyaXB0TWFwKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBzY3JpcHRJbmNsdWRlcyA9IGF3YWl0IGdldFNjcmlwdEluY2x1ZGVzKGN1cnJlbnRTY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgsIGFsbFNjcmlwdHMpO1xuXG5cdGxldCByZXN1bHQgPSBjdXJyZW50U2NyaXB0LnNjcmlwdDtcblxuXHRsZXQgaW5jbHVkZU1hdGNoT2Zmc2V0ID0gMDtcblxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHNjcmlwdEluY2x1ZGVzLmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0bGV0IHNjcmlwdEluY2x1ZGUgPSBzY3JpcHRJbmNsdWRlc1tpXTtcblxuXHRcdGlmIChjdXJyZW50U2NyaXB0QW5jZXN0b3JzW3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoXSlcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDeWNsZSBkZXRlY3RlZFwiKTtcblx0XHR9XG5cdFx0aWYgKHNjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoID09PSBjdXJyZW50U2NyaXB0LnNjcmlwdEZpbGVQYXRoKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkF0dGVtcHQgdG8gaW5jbHVkZSBzZWxmXCIpO1xuXHRcdH1cblxuXHRcdGxldCBiZWZvcmVJbmNsdWRlID0gcmVzdWx0LnN1YnN0cmluZygwLCBpbmNsdWRlTWF0Y2hPZmZzZXQgKyBzY3JpcHRJbmNsdWRlLmluY2x1ZGVNYXRjaE9mZnNldCk7XG5cdFx0bGV0IGFmdGVySW5jbHVkZSA9IHJlc3VsdC5zdWJzdHJpbmcoaW5jbHVkZU1hdGNoT2Zmc2V0ICsgc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hPZmZzZXQgKyBzY3JpcHRJbmNsdWRlLmluY2x1ZGVNYXRjaExlbmd0aCk7XG5cblx0XHRsZXQgaW5jbHVkZVZhbHVlOiBzdHJpbmcgPSBcIlwiO1xuXG5cdFx0aWYgKHByb2Nlc3NlZFNjcmlwdHNbc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGhdKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGBTY3JpcHQgJHtzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aH0gYWxyZWFkeSBpbmNsdWRlZGApO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bGV0IGNoaWxkQW5jZXN0b3JzID0gT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFNjcmlwdEFuY2VzdG9ycyk7XG5cdFx0XHRjaGlsZEFuY2VzdG9yc1tjdXJyZW50U2NyaXB0LnNjcmlwdEZpbGVQYXRoXSA9IHRydWU7XG5cblx0XHRcdGluY2x1ZGVWYWx1ZSA9IGF3YWl0IGluc2VydFNvcnRlZEluY2x1ZGVzKHNjcmlwdEluY2x1ZGUuc2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoLCBjaGlsZEFuY2VzdG9ycywgcHJvY2Vzc2VkU2NyaXB0cywgYWxsU2NyaXB0cyk7XG5cdFx0XHRpbmNsdWRlVmFsdWUgPSBzaGFkZXJOZXdMaW5lICsgaW5jbHVkZVZhbHVlICsgc2hhZGVyTmV3TGluZTtcblxuXHRcdFx0cHJvY2Vzc2VkU2NyaXB0c1tzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aF0gPSB0cnVlXG5cdFx0fVxuXG5cdFx0cmVzdWx0ID0gYmVmb3JlSW5jbHVkZSArIGluY2x1ZGVWYWx1ZSArIGFmdGVySW5jbHVkZTtcblx0XHRpbmNsdWRlTWF0Y2hPZmZzZXQgKz0gKGluY2x1ZGVWYWx1ZS5sZW5ndGggLSBzY3JpcHRJbmNsdWRlLmluY2x1ZGVNYXRjaExlbmd0aCk7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5pbnRlcmZhY2UgSW5jbHVkZUluZm9cbntcblx0c2NyaXB0OiBTY3JpcHRJbmZvO1xuXHRpbmNsdWRlTWF0Y2hPZmZzZXQ6IG51bWJlcjtcblx0aW5jbHVkZU1hdGNoTGVuZ3RoOiBudW1iZXI7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNjcmlwdEluY2x1ZGVzKFxuXHRzY3JpcHQ6IFNjcmlwdEluZm8sXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXG5cdHBhdGg6IHBhdGgsXG5cdGFsbFNjcmlwdHM6IFNjcmlwdE1hcCk6IFByb21pc2U8SW5jbHVkZUluZm9bXT5cbntcblx0bGV0IGluY2x1ZGVzOiBJbmNsdWRlSW5mb1tdID0gW107XG5cblx0aWYgKChudWxsICE9PSBzY3JpcHQpICYmICh1bmRlZmluZWQgIT09IHNjcmlwdCkpXG5cdHtcblx0XHRsZXQgcmVnZXggPSAvXlxcI3ByYWdtYSBpbmNsdWRlIFxcXCIoLiopXFxcIiQvZ207XG5cblx0XHRsZXQgaW5jbHVkZU1hdGNoID0gcmVnZXguZXhlYyhzY3JpcHQuc2NyaXB0KTtcblxuXHRcdHdoaWxlIChpbmNsdWRlTWF0Y2gpXG5cdFx0e1xuXHRcdFx0bGV0IHJlbGF0aXZlSW5jbHVkZUZpbGVQYXRoID0gaW5jbHVkZU1hdGNoWzFdO1xuXG5cdFx0XHRsZXQgaW5jbHVkZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKHNjcmlwdC5zY3JpcHRGb2xkZXJQYXRoLCByZWxhdGl2ZUluY2x1ZGVGaWxlUGF0aCk7XG5cdFx0XHRsZXQgaW5jbHVkZUZvbGRlclBhdGggPSBwYXRoLmRpcm5hbWUoaW5jbHVkZUZpbGVQYXRoKTtcblx0XHRcdGxldCBpbmNsdWRlRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGluY2x1ZGVGaWxlUGF0aCk7XG5cblx0XHRcdGxldCBpbmNsdWRlU2NyaXB0ID0gYWxsU2NyaXB0c1tpbmNsdWRlRmlsZVBhdGhdO1xuXG5cdFx0XHRpZiAoKG51bGwgPT09IGluY2x1ZGVTY3JpcHQpIHx8ICh1bmRlZmluZWQgPT09IGluY2x1ZGVTY3JpcHQpKVxuXHRcdFx0e1xuXHRcdFx0XHRpbmNsdWRlU2NyaXB0ID1cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzY3JpcHQ6IGF3YWl0IHJlYWRTaGFkZXJTY3JpcHQoaW5jbHVkZUZpbGVQYXRoLCByZWFkU2NyaXB0KSxcblx0XHRcdFx0XHRcdHNjcmlwdEZpbGVQYXRoOiBpbmNsdWRlRmlsZVBhdGgsXG5cdFx0XHRcdFx0XHRzY3JpcHRGb2xkZXJQYXRoOiBpbmNsdWRlRm9sZGVyUGF0aCxcblx0XHRcdFx0XHRcdHNjcmlwdEZpbGVOYW1lOiBpbmNsdWRlRmlsZU5hbWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRhbGxTY3JpcHRzW2luY2x1ZGVGaWxlUGF0aF0gPSBpbmNsdWRlU2NyaXB0O1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgaW5jbHVkZUluZm86IEluY2x1ZGVJbmZvID1cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNjcmlwdDogaW5jbHVkZVNjcmlwdCxcblx0XHRcdFx0XHRpbmNsdWRlTWF0Y2hPZmZzZXQ6IGluY2x1ZGVNYXRjaC5pbmRleCxcblx0XHRcdFx0XHRpbmNsdWRlTWF0Y2hMZW5ndGg6IGluY2x1ZGVNYXRjaFswXS5sZW5ndGhcblx0XHRcdFx0fTtcblxuXHRcdFx0aW5jbHVkZXMucHVzaChpbmNsdWRlSW5mbyk7XG5cblx0XHRcdGluY2x1ZGVNYXRjaCA9IHJlZ2V4LmV4ZWMoc2NyaXB0LnNjcmlwdCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGluY2x1ZGVzO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkU2hhZGVyU2NyaXB0KHBhdGg6IHN0cmluZywgcmVhZFNjcmlwdDogcmVhZFNjcmlwdCk6IFByb21pc2U8c3RyaW5nPlxue1xuXHRsZXQgc2NyaXB0ID0gYXdhaXQgcmVhZFNjcmlwdChwYXRoKTtcblx0cmV0dXJuIGZpeExpbmVFbmRpbmdzKHNjcmlwdCk7XG59XG5cbmZ1bmN0aW9uIGZpeExpbmVFbmRpbmdzKHNvdXJjZTogc3RyaW5nKVxue1xuXHRyZXR1cm4gc291cmNlLnJlcGxhY2UoXCJcXHJcXG5cIiwgc2hhZGVyTmV3TGluZSk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZExpbmUoY3VycmVudFZhbHVlOiBzdHJpbmcsIGxpbmVUb0FwcGVuZDogc3RyaW5nKTogc3RyaW5nXG57XG5cdGlmICgobnVsbCA9PT0gbGluZVRvQXBwZW5kKSB8fCAodW5kZWZpbmVkID09PSBsaW5lVG9BcHBlbmQpKVxuXHR7XG5cdFx0cmV0dXJuIGN1cnJlbnRWYWx1ZTtcblx0fVxuXG5cdHJldHVybiBjdXJyZW50VmFsdWUgKyBsaW5lVG9BcHBlbmQgKyBzaGFkZXJOZXdMaW5lO1xufVxuIl19