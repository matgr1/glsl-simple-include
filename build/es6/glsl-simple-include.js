"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
let stripBom = require("strip-bom");
const shaderNewLine = "\n";
function processIncludes(readScript, path, entryScriptPath, entryScript, preprocessorDefines) {
    return __awaiter(this, void 0, void 0, function* () {
        let entryFilePath = path.resolve(entryScriptPath);
        let entryFolderPath = path.dirname(entryFilePath);
        let entryFileName = path.basename(entryFilePath);
        if ((null === entryScript) || (undefined === entryScript)) {
            entryScript = yield readShaderScript(entryFilePath, readScript);
        }
        return yield processScript({
            script: entryScript,
            scriptFilePath: entryFilePath,
            scriptFolderPath: entryFolderPath,
            scriptFileName: entryFileName
        }, readScript, path, preprocessorDefines);
    });
}
exports.processIncludes = processIncludes;
function processScript(entryScript, readScript, path, preprocessorDefines) {
    return __awaiter(this, void 0, void 0, function* () {
        // strip version
        let versionString = null;
        let versionRegex = /^\s*#version .*$/m;
        let versionMatch = versionRegex.exec(entryScript.script);
        if ((null !== versionMatch) && (undefined !== versionMatch)) {
            let afterVersionIndex = versionMatch.index + versionMatch[0].length;
            versionString = versionMatch[0].trim();
            entryScript.script = entryScript.script.substr(afterVersionIndex);
        }
        // append version and preprocessor macros
        let result = "";
        result = appendLine(result, versionString);
        if ((null !== preprocessorDefines) && (undefined !== preprocessorDefines)) {
            preprocessorDefines.forEach(function (define) {
                result = appendLine(result, `#define ${define}`);
            });
        }
        // build the script
        result = yield buildScript(result, entryScript, readScript, path);
        return stripBom(result).trim();
    });
}
function buildScript(result, entryScript, readScript, path) {
    return __awaiter(this, void 0, void 0, function* () {
        let allScripts = {};
        let processedScripts = {};
        let ancestors = {};
        let fullScript = yield insertSortedIncludes(entryScript, readScript, path, ancestors, processedScripts, allScripts);
        result = appendLine(result, fullScript);
        return result;
    });
}
function insertSortedIncludes(currentScript, readScript, path, currentScriptAncestors, processedScripts, allScripts) {
    return __awaiter(this, void 0, void 0, function* () {
        let scriptIncludes = yield getScriptIncludes(currentScript, readScript, path, allScripts);
        let result = currentScript.script;
        let includeMatchOffset = 0;
        for (let i = 0; i < scriptIncludes.length; i++) {
            let scriptInclude = scriptIncludes[i];
            if (currentScriptAncestors[scriptInclude.script.scriptFilePath]) {
                throw new Error("Cycle detected");
            }
            if (scriptInclude.script.scriptFilePath === currentScript.scriptFilePath) {
                throw new Error("Attempt to include self");
            }
            let beforeInclude = result.substring(0, includeMatchOffset + scriptInclude.includeMatchOffset);
            let afterInclude = result.substring(includeMatchOffset + scriptInclude.includeMatchOffset + scriptInclude.includeMatchLength);
            let includeValue = "";
            if (processedScripts[scriptInclude.script.scriptFilePath]) {
                console.log(`Script ${scriptInclude.script.scriptFilePath} already included`);
            }
            else {
                let childAncestors = Object.assign({}, currentScriptAncestors);
                childAncestors[currentScript.scriptFilePath] = true;
                includeValue = yield insertSortedIncludes(scriptInclude.script, readScript, path, childAncestors, processedScripts, allScripts);
                includeValue = shaderNewLine + includeValue + shaderNewLine;
                processedScripts[scriptInclude.script.scriptFilePath] = true;
            }
            result = beforeInclude + includeValue + afterInclude;
            includeMatchOffset += (includeValue.length - scriptInclude.includeMatchLength);
        }
        return result;
    });
}
function getScriptIncludes(script, readScript, path, allScripts) {
    return __awaiter(this, void 0, void 0, function* () {
        let includes = [];
        if ((null !== script) && (undefined !== script)) {
            let regex = /^\#pragma include \"(.*)\"$/gm;
            let includeMatch = regex.exec(script.script);
            while (includeMatch) {
                let relativeIncludeFilePath = includeMatch[1];
                let includeFilePath = path.resolve(script.scriptFolderPath, relativeIncludeFilePath);
                let includeFolderPath = path.dirname(includeFilePath);
                let includeFileName = path.basename(includeFilePath);
                let includeScript = allScripts[includeFilePath];
                if ((null === includeScript) || (undefined === includeScript)) {
                    includeScript =
                        {
                            script: yield readShaderScript(includeFilePath, readScript),
                            scriptFilePath: includeFilePath,
                            scriptFolderPath: includeFolderPath,
                            scriptFileName: includeFileName
                        };
                    allScripts[includeFilePath] = includeScript;
                }
                let includeInfo = {
                    script: includeScript,
                    includeMatchOffset: includeMatch.index,
                    includeMatchLength: includeMatch[0].length
                };
                includes.push(includeInfo);
                includeMatch = regex.exec(script.script);
            }
        }
        return includes;
    });
}
function readShaderScript(path, readScript) {
    return __awaiter(this, void 0, void 0, function* () {
        let script = yield readScript(path);
        return fixLineEndings(script);
    });
}
function fixLineEndings(source) {
    return source.replace("\r\n", shaderNewLine);
}
function appendLine(currentValue, lineToAppend) {
    if ((null === lineToAppend) || (undefined === lineToAppend)) {
        return currentValue;
    }
    return currentValue + lineToAppend + shaderNewLine;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xzbC1zaW1wbGUtaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nbHNsLXNpbXBsZS1pbmNsdWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQVdwQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFFM0IseUJBQ0MsVUFBc0IsRUFDdEIsSUFBVSxFQUNWLGVBQXVCLEVBQ3ZCLFdBQW9CLEVBQ3BCLG1CQUE4Qjs7UUFFOUIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNsRCxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2xELElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFakQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FDMUQsQ0FBQztZQUNBLFdBQVcsR0FBRyxNQUFNLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsTUFBTSxDQUFDLE1BQU0sYUFBYSxDQUN6QjtZQUNDLE1BQU0sRUFBRSxXQUFXO1lBQ25CLGNBQWMsRUFBRSxhQUFhO1lBQzdCLGdCQUFnQixFQUFFLGVBQWU7WUFDakMsY0FBYyxFQUFFLGFBQWE7U0FDN0IsRUFDRCxVQUFVLEVBQ1YsSUFBSSxFQUNKLG1CQUFtQixDQUFDLENBQUM7SUFDdkIsQ0FBQzs7QUExQnFCLHVCQUFlLGtCQTBCcEMsQ0FBQTtBQVVELHVCQUNDLFdBQXVCLEVBQ3ZCLFVBQXNCLEVBQ3RCLElBQVUsRUFDVixtQkFBOEI7O1FBRTlCLGdCQUFnQjtRQUNoQixJQUFJLGFBQWEsR0FBVyxJ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bSA9IHJlcXVpcmUoXCJzdHJpcC1ib21cIik7XG5cbmV4cG9ydCB0eXBlIHJlYWRTY3JpcHQgPSAocGF0aDogc3RyaW5nKSA9PiBQcm9taXNlPHN0cmluZz47XG5cbmV4cG9ydCBpbnRlcmZhY2UgcGF0aFxue1xuXHRyZXNvbHZlKC4uLnBhdGg6IHN0cmluZ1tdKTogc3RyaW5nO1xuXHRkaXJuYW1lKHBhdGg6IHN0cmluZyk6IHN0cmluZztcblx0YmFzZW5hbWUocGF0aDogc3RyaW5nLCBleHQ/OiBzdHJpbmcpOiBzdHJpbmc7XG59XG5cbmNvbnN0IHNoYWRlck5ld0xpbmUgPSBcIlxcblwiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0luY2x1ZGVzKFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRlbnRyeVNjcmlwdFBhdGg6IHN0cmluZyxcblx0ZW50cnlTY3JpcHQ/OiBzdHJpbmcsXG5cdHByZXByb2Nlc3NvckRlZmluZXM/OiBzdHJpbmdbXSk6IFByb21pc2U8c3RyaW5nPlxue1xuXHRsZXQgZW50cnlGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShlbnRyeVNjcmlwdFBhdGgpO1xuXHRsZXQgZW50cnlGb2xkZXJQYXRoID0gcGF0aC5kaXJuYW1lKGVudHJ5RmlsZVBhdGgpO1xuXHRsZXQgZW50cnlGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoZW50cnlGaWxlUGF0aCk7XG5cblx0aWYgKChudWxsID09PSBlbnRyeVNjcmlwdCkgfHwgKHVuZGVmaW5lZCA9PT0gZW50cnlTY3JpcHQpKVxuXHR7XG5cdFx0ZW50cnlTY3JpcHQgPSBhd2FpdCByZWFkU2hhZGVyU2NyaXB0KGVudHJ5RmlsZVBhdGgsIHJlYWRTY3JpcHQpO1xuXHR9XG5cblx0cmV0dXJuIGF3YWl0IHByb2Nlc3NTY3JpcHQoXG5cdFx0e1xuXHRcdFx0c2NyaXB0OiBlbnRyeVNjcmlwdCxcblx0XHRcdHNjcmlwdEZpbGVQYXRoOiBlbnRyeUZpbGVQYXRoLFxuXHRcdFx0c2NyaXB0Rm9sZGVyUGF0aDogZW50cnlGb2xkZXJQYXRoLFxuXHRcdFx0c2NyaXB0RmlsZU5hbWU6IGVudHJ5RmlsZU5hbWVcblx0XHR9LFxuXHRcdHJlYWRTY3JpcHQsXG5cdFx0cGF0aCxcblx0XHRwcmVwcm9jZXNzb3JEZWZpbmVzKTtcbn1cblxuaW50ZXJmYWNlIFNjcmlwdEluZm9cbntcblx0c2NyaXB0OiBzdHJpbmc7XG5cdHNjcmlwdEZpbGVQYXRoOiBzdHJpbmc7XG5cdHNjcmlwdEZvbGRlclBhdGg6IHN0cmluZztcblx0c2NyaXB0RmlsZU5hbWU6IHN0cmluZztcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc1NjcmlwdChcblx0ZW50cnlTY3JpcHQ6IFNjcmlwdEluZm8sXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXG5cdHBhdGg6IHBhdGgsXG5cdHByZXByb2Nlc3NvckRlZmluZXM/OiBzdHJpbmdbXSk6IFByb21pc2U8c3RyaW5nPlxue1xuXHQvLyBzdHJpcCB2ZXJzaW9uXG5cdGxldCB2ZXJzaW9uU3RyaW5nOiBzdHJpbmcgPSBudWxsO1xuXG5cdGxldCB2ZXJzaW9uUmVnZXggPSAvXlxccyojdmVyc2lvbiAuKiQvbTtcblx0bGV0IHZlcnNpb25NYXRjaCA9IHZlcnNpb25SZWdleC5leGVjKGVudHJ5U2NyaXB0LnNjcmlwdCk7XG5cblx0aWYgKChudWxsICE9PSB2ZXJzaW9uTWF0Y2gpICYmICh1bmRlZmluZWQgIT09IHZlcnNpb25NYXRjaCkpXG5cdHtcblx0XHRsZXQgYWZ0ZXJWZXJzaW9uSW5kZXggPSB2ZXJzaW9uTWF0Y2guaW5kZXggKyB2ZXJzaW9uTWF0Y2hbMF0ubGVuZ3RoO1xuXG5cdFx0dmVyc2lvblN0cmluZyA9IHZlcnNpb25NYXRjaFswXS50cmltKCk7XG5cdFx0ZW50cnlTY3JpcHQuc2NyaXB0ID0gZW50cnlTY3JpcHQuc2NyaXB0LnN1YnN0cihhZnRlclZlcnNpb25JbmRleCk7XG5cdH1cblxuXHQvLyBhcHBlbmQgdmVyc2lvbiBhbmQgcHJlcHJvY2Vzc29yIG1hY3Jvc1xuXHRsZXQgcmVzdWx0ID0gXCJcIjtcblx0cmVzdWx0ID0gYXBwZW5kTGluZShyZXN1bHQsIHZlcnNpb25TdHJpbmcpO1xuXG5cdGlmICgobnVsbCAhPT0gcHJlcHJvY2Vzc29yRGVmaW5lcykgJiYgKHVuZGVmaW5lZCAhPT0gcHJlcHJvY2Vzc29yRGVmaW5lcykpXG5cdHtcblx0XHRwcmVwcm9jZXNzb3JEZWZpbmVzLmZvckVhY2goXG5cdFx0XHRmdW5jdGlvbiAoZGVmaW5lKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXN1bHQgPSBhcHBlbmRMaW5lKHJlc3VsdCwgYCNkZWZpbmUgJHtkZWZpbmV9YCk7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8vIGJ1aWxkIHRoZSBzY3JpcHRcblx0cmVzdWx0ID0gYXdhaXQgYnVpbGRTY3JpcHQocmVzdWx0LCBlbnRyeVNjcmlwdCwgcmVhZFNjcmlwdCwgcGF0aCk7XG5cblx0cmV0dXJuIHN0cmlwQm9tKHJlc3VsdCkudHJpbSgpO1xufVxuXG5pbnRlcmZhY2UgU2NyaXB0TWFwXG57XG5cdFtzY3JpcHRGaWxlUGF0aDogc3RyaW5nXTogU2NyaXB0SW5mb1xufVxuaW50ZXJmYWNlIFByb2Nlc3NlZFNjcmlwdE1hcFxue1xuXHRbc2NyaXB0RmlsZVBhdGg6IHN0cmluZ106IGJvb2xlYW5cbn1cblxuYXN5bmMgZnVuY3Rpb24gYnVpbGRTY3JpcHQocmVzdWx0OiBzdHJpbmcsIGVudHJ5U2NyaXB0OiBTY3JpcHRJbmZvLCByZWFkU2NyaXB0OiByZWFkU2NyaXB0LCBwYXRoOiBwYXRoKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBhbGxTY3JpcHRzOiBTY3JpcHRNYXAgPSB7fTtcblx0bGV0IHByb2Nlc3NlZFNjcmlwdHM6IFByb2Nlc3NlZFNjcmlwdE1hcCA9IHt9O1xuXHRsZXQgYW5jZXN0b3JzOiBQcm9jZXNzZWRTY3JpcHRNYXAgPSB7fTtcblxuXHRsZXQgZnVsbFNjcmlwdCA9IGF3YWl0IGluc2VydFNvcnRlZEluY2x1ZGVzKGVudHJ5U2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoLCBhbmNlc3RvcnMsIHByb2Nlc3NlZFNjcmlwdHMsIGFsbFNjcmlwdHMpO1xuXG5cdHJlc3VsdCA9IGFwcGVuZExpbmUocmVzdWx0LCBmdWxsU2NyaXB0KTtcblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbnNlcnRTb3J0ZWRJbmNsdWRlcyhcblx0Y3VycmVudFNjcmlwdDogU2NyaXB0SW5mbyxcblx0cmVhZFNjcmlwdDogcmVhZFNjcmlwdCxcblx0cGF0aDogcGF0aCxcblx0Y3VycmVudFNjcmlwdEFuY2VzdG9yczogUHJvY2Vzc2VkU2NyaXB0TWFwLFxuXHRwcm9jZXNzZWRTY3JpcHRzOiBQcm9jZXNzZWRTY3JpcHRNYXAsXG5cdGFsbFNjcmlwdHM6IFNjcmlwdE1hcCk6IFByb21pc2U8c3RyaW5nPlxue1xuXHRsZXQgc2NyaXB0SW5jbHVkZXMgPSBhd2FpdCBnZXRTY3JpcHRJbmNsdWRlcyhjdXJyZW50U2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoLCBhbGxTY3JpcHRzKTtcblxuXHRsZXQgcmVzdWx0ID0gY3VycmVudFNjcmlwdC5zY3JpcHQ7XG5cblx0bGV0IGluY2x1ZGVNYXRjaE9mZnNldCA9IDA7XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzY3JpcHRJbmNsdWRlcy5sZW5ndGg7IGkrKylcblx0e1xuXHRcdGxldCBzY3JpcHRJbmNsdWRlID0gc2NyaXB0SW5jbHVkZXNbaV07XG5cblx0XHRpZiAoY3VycmVudFNjcmlwdEFuY2VzdG9yc1tzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aF0pXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ3ljbGUgZGV0ZWN0ZWRcIik7XG5cdFx0fVxuXHRcdGlmIChzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aCA9PT0gY3VycmVudFNjcmlwdC5zY3JpcHRGaWxlUGF0aClcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBdHRlbXB0IHRvIGluY2x1ZGUgc2VsZlwiKTtcblx0XHR9XG5cblx0XHRsZXQgYmVmb3JlSW5jbHVkZSA9IHJlc3VsdC5zdWJzdHJpbmcoMCwgaW5jbHVkZU1hdGNoT2Zmc2V0ICsgc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hPZmZzZXQpO1xuXHRcdGxldCBhZnRlckluY2x1ZGUgPSByZXN1bHQuc3Vic3RyaW5nKGluY2x1ZGVNYXRjaE9mZnNldCArIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoT2Zmc2V0ICsgc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hMZW5ndGgpO1xuXG5cdFx0bGV0IGluY2x1ZGVWYWx1ZTogc3RyaW5nID0gXCJcIjtcblxuXHRcdGlmIChwcm9jZXNzZWRTY3JpcHRzW3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoXSlcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhgU2NyaXB0ICR7c2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGh9IGFscmVhZHkgaW5jbHVkZWRgKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxldCBjaGlsZEFuY2VzdG9ycyA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRTY3JpcHRBbmNlc3RvcnMpO1xuXHRcdFx0Y2hpbGRBbmNlc3RvcnNbY3VycmVudFNjcmlwdC5zY3JpcHRGaWxlUGF0aF0gPSB0cnVlO1xuXG5cdFx0XHRpbmNsdWRlVmFsdWUgPSBhd2FpdCBpbnNlcnRTb3J0ZWRJbmNsdWRlcyhzY3JpcHRJbmNsdWRlLnNjcmlwdCwgcmVhZFNjcmlwdCwgcGF0aCwgY2hpbGRBbmNlc3RvcnMsIHByb2Nlc3NlZFNjcmlwdHMsIGFsbFNjcmlwdHMpO1xuXHRcdFx0aW5jbHVkZVZhbHVlID0gc2hhZGVyTmV3TGluZSArIGluY2x1ZGVWYWx1ZSArIHNoYWRlck5ld0xpbmU7XG5cblx0XHRcdHByb2Nlc3NlZFNjcmlwdHNbc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGhdID0gdHJ1ZVxuXHRcdH1cblxuXHRcdHJlc3VsdCA9IGJlZm9yZUluY2x1ZGUgKyBpbmNsdWRlVmFsdWUgKyBhZnRlckluY2x1ZGU7XG5cdFx0aW5jbHVkZU1hdGNoT2Zmc2V0ICs9IChpbmNsdWRlVmFsdWUubGVuZ3RoIC0gc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hMZW5ndGgpO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuaW50ZXJmYWNlIEluY2x1ZGVJbmZvXG57XG5cdHNjcmlwdDogU2NyaXB0SW5mbztcblx0aW5jbHVkZU1hdGNoT2Zmc2V0OiBudW1iZXI7XG5cdGluY2x1ZGVNYXRjaExlbmd0aDogbnVtYmVyO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRTY3JpcHRJbmNsdWRlcyhcblx0c2NyaXB0OiBTY3JpcHRJbmZvLFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRhbGxTY3JpcHRzOiBTY3JpcHRNYXApOiBQcm9taXNlPEluY2x1ZGVJbmZvW10+XG57XG5cdGxldCBpbmNsdWRlczogSW5jbHVkZUluZm9bXSA9IFtdO1xuXG5cdGlmICgobnVsbCAhPT0gc2NyaXB0KSAmJiAodW5kZWZpbmVkICE9PSBzY3JpcHQpKVxuXHR7XG5cdFx0bGV0IHJlZ2V4ID0gL15cXCNwcmFnbWEgaW5jbHVkZSBcXFwiKC4qKVxcXCIkL2dtO1xuXG5cdFx0bGV0IGluY2x1ZGVNYXRjaCA9IHJlZ2V4LmV4ZWMoc2NyaXB0LnNjcmlwdCk7XG5cblx0XHR3aGlsZSAoaW5jbHVkZU1hdGNoKVxuXHRcdHtcblx0XHRcdGxldCByZWxhdGl2ZUluY2x1ZGVGaWxlUGF0aCA9IGluY2x1ZGVNYXRjaFsxXTtcblxuXHRcdFx0bGV0IGluY2x1ZGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShzY3JpcHQuc2NyaXB0Rm9sZGVyUGF0aCwgcmVsYXRpdmVJbmNsdWRlRmlsZVBhdGgpO1xuXHRcdFx0bGV0IGluY2x1ZGVGb2xkZXJQYXRoID0gcGF0aC5kaXJuYW1lKGluY2x1ZGVGaWxlUGF0aCk7XG5cdFx0XHRsZXQgaW5jbHVkZUZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShpbmNsdWRlRmlsZVBhdGgpO1xuXG5cdFx0XHRsZXQgaW5jbHVkZVNjcmlwdCA9IGFsbFNjcmlwdHNbaW5jbHVkZUZpbGVQYXRoXTtcblxuXHRcdFx0aWYgKChudWxsID09PSBpbmNsdWRlU2NyaXB0KSB8fCAodW5kZWZpbmVkID09PSBpbmNsdWRlU2NyaXB0KSlcblx0XHRcdHtcblx0XHRcdFx0aW5jbHVkZVNjcmlwdCA9XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2NyaXB0OiBhd2FpdCByZWFkU2hhZGVyU2NyaXB0KGluY2x1ZGVGaWxlUGF0aCwgcmVhZFNjcmlwdCksXG5cdFx0XHRcdFx0XHRzY3JpcHRGaWxlUGF0aDogaW5jbHVkZUZpbGVQYXRoLFxuXHRcdFx0XHRcdFx0c2NyaXB0Rm9sZGVyUGF0aDogaW5jbHVkZUZvbGRlclBhdGgsXG5cdFx0XHRcdFx0XHRzY3JpcHRGaWxlTmFtZTogaW5jbHVkZUZpbGVOYW1lXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0YWxsU2NyaXB0c1tpbmNsdWRlRmlsZVBhdGhdID0gaW5jbHVkZVNjcmlwdDtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGluY2x1ZGVJbmZvOiBJbmNsdWRlSW5mbyA9XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzY3JpcHQ6IGluY2x1ZGVTY3JpcHQsXG5cdFx0XHRcdFx0aW5jbHVkZU1hdGNoT2Zmc2V0OiBpbmNsdWRlTWF0Y2guaW5kZXgsXG5cdFx0XHRcdFx0aW5jbHVkZU1hdGNoTGVuZ3RoOiBpbmNsdWRlTWF0Y2hbMF0ubGVuZ3RoXG5cdFx0XHRcdH07XG5cblx0XHRcdGluY2x1ZGVzLnB1c2goaW5jbHVkZUluZm8pO1xuXG5cdFx0XHRpbmNsdWRlTWF0Y2ggPSByZWdleC5leGVjKHNjcmlwdC5zY3JpcHQpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBpbmNsdWRlcztcbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVhZFNoYWRlclNjcmlwdChwYXRoOiBzdHJpbmcsIHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQpOiBQcm9taXNlPHN0cmluZz5cbntcblx0bGV0IHNjcmlwdCA9IGF3YWl0IHJlYWRTY3JpcHQocGF0aCk7XG5cdHJldHVybiBmaXhMaW5lRW5kaW5ncyhzY3JpcHQpO1xufVxuXG5mdW5jdGlvbiBmaXhMaW5lRW5kaW5ncyhzb3VyY2U6IHN0cmluZylcbntcblx0cmV0dXJuIHNvdXJjZS5yZXBsYWNlKFwiXFxyXFxuXCIsIHNoYWRlck5ld0xpbmUpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRMaW5lKGN1cnJlbnRWYWx1ZTogc3RyaW5nLCBsaW5lVG9BcHBlbmQ6IHN0cmluZyk6IHN0cmluZ1xue1xuXHRpZiAoKG51bGwgPT09IGxpbmVUb0FwcGVuZCkgfHwgKHVuZGVmaW5lZCA9PT0gbGluZVRvQXBwZW5kKSlcblx0e1xuXHRcdHJldHVybiBjdXJyZW50VmFsdWU7XG5cdH1cblxuXHRyZXR1cm4gY3VycmVudFZhbHVlICsgbGluZVRvQXBwZW5kICsgc2hhZGVyTmV3TGluZTtcbn1cbiJdfQ==