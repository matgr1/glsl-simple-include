"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
require("babel-polyfill");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xzbC1zaW1wbGUtaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nbHNsLXNpbXBsZS1pbmNsdWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUVBLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBRTFCLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQVdwQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFFM0IseUJBQ0MsVUFBc0IsRUFDdEIsSUFBVSxFQUNWLGVBQXVCLEVBQ3ZCLFdBQW9CLEVBQ3BCLG1CQUE4Qjs7UUFFOUIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNsRCxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2xELElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFakQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FDMUQsQ0FBQztZQUNBLFdBQVcsR0FBRyxNQUFNLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBRUQsTUFBTSxDQUFDLE1BQU0sYUFBYSxDQUN6QjtZQUNDLE1BQU0sRUFBRSxXQUFXO1lBQ25CLGNBQWMsRUFBRSxhQUFhO1lBQzdCLGdCQUFnQixFQUFFLGVBQWU7WUFDakMsY0FBYyxFQUFFLGFBQWE7U0FDN0IsRUFDRCxVQUFVLEVBQ1YsSUFBSSxFQUNKLG1CQUFtQixDQUFDLENBQUM7SUFDdkIsQ0FBQzs7QUExQnFCLHVCQUFlLGtCQTBCcEMsQ0FBQTtBQVVELHVCQUNDLFdBQXVCLEVBQ3ZCLFVBQXNCLEVBQ3RCLElBQVUsRUFDVixtQkFBOEI7O1FB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cmUgbGV0IHJlcXVpcmU6IGFueTtcblxucmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuXG5sZXQgc3RyaXBCb20gPSByZXF1aXJlKFwic3RyaXAtYm9tXCIpO1xuXG5leHBvcnQgdHlwZSByZWFkU2NyaXB0ID0gKHBhdGg6IHN0cmluZykgPT4gUHJvbWlzZTxzdHJpbmc+O1xuXG5leHBvcnQgaW50ZXJmYWNlIHBhdGhcbntcblx0cmVzb2x2ZSguLi5wYXRoOiBzdHJpbmdbXSk6IHN0cmluZztcblx0ZGlybmFtZShwYXRoOiBzdHJpbmcpOiBzdHJpbmc7XG5cdGJhc2VuYW1lKHBhdGg6IHN0cmluZywgZXh0Pzogc3RyaW5nKTogc3RyaW5nO1xufVxuXG5jb25zdCBzaGFkZXJOZXdMaW5lID0gXCJcXG5cIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NJbmNsdWRlcyhcblx0cmVhZFNjcmlwdDogcmVhZFNjcmlwdCxcblx0cGF0aDogcGF0aCxcblx0ZW50cnlTY3JpcHRQYXRoOiBzdHJpbmcsXG5cdGVudHJ5U2NyaXB0Pzogc3RyaW5nLFxuXHRwcmVwcm9jZXNzb3JEZWZpbmVzPzogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz5cbntcblx0bGV0IGVudHJ5RmlsZVBhdGggPSBwYXRoLnJlc29sdmUoZW50cnlTY3JpcHRQYXRoKTtcblx0bGV0IGVudHJ5Rm9sZGVyUGF0aCA9IHBhdGguZGlybmFtZShlbnRyeUZpbGVQYXRoKTtcblx0bGV0IGVudHJ5RmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGVudHJ5RmlsZVBhdGgpO1xuXG5cdGlmICgobnVsbCA9PT0gZW50cnlTY3JpcHQpIHx8ICh1bmRlZmluZWQgPT09IGVudHJ5U2NyaXB0KSlcblx0e1xuXHRcdGVudHJ5U2NyaXB0ID0gYXdhaXQgcmVhZFNoYWRlclNjcmlwdChlbnRyeUZpbGVQYXRoLCByZWFkU2NyaXB0KTtcblx0fVxuXG5cdHJldHVybiBhd2FpdCBwcm9jZXNzU2NyaXB0KFxuXHRcdHtcblx0XHRcdHNjcmlwdDogZW50cnlTY3JpcHQsXG5cdFx0XHRzY3JpcHRGaWxlUGF0aDogZW50cnlGaWxlUGF0aCxcblx0XHRcdHNjcmlwdEZvbGRlclBhdGg6IGVudHJ5Rm9sZGVyUGF0aCxcblx0XHRcdHNjcmlwdEZpbGVOYW1lOiBlbnRyeUZpbGVOYW1lXG5cdFx0fSxcblx0XHRyZWFkU2NyaXB0LFxuXHRcdHBhdGgsXG5cdFx0cHJlcHJvY2Vzc29yRGVmaW5lcyk7XG59XG5cbmludGVyZmFjZSBTY3JpcHRJbmZvXG57XG5cdHNjcmlwdDogc3RyaW5nO1xuXHRzY3JpcHRGaWxlUGF0aDogc3RyaW5nO1xuXHRzY3JpcHRGb2xkZXJQYXRoOiBzdHJpbmc7XG5cdHNjcmlwdEZpbGVOYW1lOiBzdHJpbmc7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NTY3JpcHQoXG5cdGVudHJ5U2NyaXB0OiBTY3JpcHRJbmZvLFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRwcmVwcm9jZXNzb3JEZWZpbmVzPzogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz5cbntcblx0Ly8gc3RyaXAgdmVyc2lvblxuXHRsZXQgdmVyc2lvblN0cmluZzogc3RyaW5nID0gbnVsbDtcblxuXHRsZXQgdmVyc2lvblJlZ2V4ID0gL15cXHMqI3ZlcnNpb24gLiokL207XG5cdGxldCB2ZXJzaW9uTWF0Y2ggPSB2ZXJzaW9uUmVnZXguZXhlYyhlbnRyeVNjcmlwdC5zY3JpcHQpO1xuXG5cdGlmICgobnVsbCAhPT0gdmVyc2lvbk1hdGNoKSAmJiAodW5kZWZpbmVkICE9PSB2ZXJzaW9uTWF0Y2gpKVxuXHR7XG5cdFx0bGV0IGFmdGVyVmVyc2lvbkluZGV4ID0gdmVyc2lvbk1hdGNoLmluZGV4ICsgdmVyc2lvbk1hdGNoWzBdLmxlbmd0aDtcblxuXHRcdHZlcnNpb25TdHJpbmcgPSB2ZXJzaW9uTWF0Y2hbMF0udHJpbSgpO1xuXHRcdGVudHJ5U2NyaXB0LnNjcmlwdCA9IGVudHJ5U2NyaXB0LnNjcmlwdC5zdWJzdHIoYWZ0ZXJWZXJzaW9uSW5kZXgpO1xuXHR9XG5cblx0Ly8gYXBwZW5kIHZlcnNpb24gYW5kIHByZXByb2Nlc3NvciBtYWNyb3Ncblx0bGV0IHJlc3VsdCA9IFwiXCI7XG5cdHJlc3VsdCA9IGFwcGVuZExpbmUocmVzdWx0LCB2ZXJzaW9uU3RyaW5nKTtcblxuXHRpZiAoKG51bGwgIT09IHByZXByb2Nlc3NvckRlZmluZXMpICYmICh1bmRlZmluZWQgIT09IHByZXByb2Nlc3NvckRlZmluZXMpKVxuXHR7XG5cdFx0cHJlcHJvY2Vzc29yRGVmaW5lcy5mb3JFYWNoKFxuXHRcdFx0ZnVuY3Rpb24gKGRlZmluZSlcblx0XHRcdHtcblx0XHRcdFx0cmVzdWx0ID0gYXBwZW5kTGluZShyZXN1bHQsIGAjZGVmaW5lICR7ZGVmaW5lfWApO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvLyBidWlsZCB0aGUgc2NyaXB0XG5cdHJlc3VsdCA9IGF3YWl0IGJ1aWxkU2NyaXB0KHJlc3VsdCwgZW50cnlTY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgpO1xuXG5cdHJldHVybiBzdHJpcEJvbShyZXN1bHQpLnRyaW0oKTtcbn1cblxuaW50ZXJmYWNlIFNjcmlwdE1hcFxue1xuXHRbc2NyaXB0RmlsZVBhdGg6IHN0cmluZ106IFNjcmlwdEluZm9cbn1cbmludGVyZmFjZSBQcm9jZXNzZWRTY3JpcHRNYXBcbntcblx0W3NjcmlwdEZpbGVQYXRoOiBzdHJpbmddOiBib29sZWFuXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGJ1aWxkU2NyaXB0KHJlc3VsdDogc3RyaW5nLCBlbnRyeVNjcmlwdDogU2NyaXB0SW5mbywgcmVhZFNjcmlwdDogcmVhZFNjcmlwdCwgcGF0aDogcGF0aCk6IFByb21pc2U8c3RyaW5nPlxue1xuXHRsZXQgYWxsU2NyaXB0czogU2NyaXB0TWFwID0ge307XG5cdGxldCBwcm9jZXNzZWRTY3JpcHRzOiBQcm9jZXNzZWRTY3JpcHRNYXAgPSB7fTtcblx0bGV0IGFuY2VzdG9yczogUHJvY2Vzc2VkU2NyaXB0TWFwID0ge307XG5cblx0bGV0IGZ1bGxTY3JpcHQgPSBhd2FpdCBpbnNlcnRTb3J0ZWRJbmNsdWRlcyhlbnRyeVNjcmlwdCwgcmVhZFNjcmlwdCwgcGF0aCwgYW5jZXN0b3JzLCBwcm9jZXNzZWRTY3JpcHRzLCBhbGxTY3JpcHRzKTtcblxuXHRyZXN1bHQgPSBhcHBlbmRMaW5lKHJlc3VsdCwgZnVsbFNjcmlwdCk7XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5zZXJ0U29ydGVkSW5jbHVkZXMoXG5cdGN1cnJlbnRTY3JpcHQ6IFNjcmlwdEluZm8sXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXG5cdHBhdGg6IHBhdGgsXG5cdGN1cnJlbnRTY3JpcHRBbmNlc3RvcnM6IFByb2Nlc3NlZFNjcmlwdE1hcCxcblx0cHJvY2Vzc2VkU2NyaXB0czogUHJvY2Vzc2VkU2NyaXB0TWFwLFxuXHRhbGxTY3JpcHRzOiBTY3JpcHRNYXApOiBQcm9taXNlPHN0cmluZz5cbntcblx0bGV0IHNjcmlwdEluY2x1ZGVzID0gYXdhaXQgZ2V0U2NyaXB0SW5jbHVkZXMoY3VycmVudFNjcmlwdCwgcmVhZFNjcmlwdCwgcGF0aCwgYWxsU2NyaXB0cyk7XG5cblx0bGV0IHJlc3VsdCA9IGN1cnJlbnRTY3JpcHQuc2NyaXB0O1xuXG5cdGxldCBpbmNsdWRlTWF0Y2hPZmZzZXQgPSAwO1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgc2NyaXB0SW5jbHVkZXMubGVuZ3RoOyBpKyspXG5cdHtcblx0XHRsZXQgc2NyaXB0SW5jbHVkZSA9IHNjcmlwdEluY2x1ZGVzW2ldO1xuXG5cdFx0aWYgKGN1cnJlbnRTY3JpcHRBbmNlc3RvcnNbc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGhdKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkN5Y2xlIGRldGVjdGVkXCIpO1xuXHRcdH1cblx0XHRpZiAoc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGggPT09IGN1cnJlbnRTY3JpcHQuc2NyaXB0RmlsZVBhdGgpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQXR0ZW1wdCB0byBpbmNsdWRlIHNlbGZcIik7XG5cdFx0fVxuXG5cdFx0bGV0IGJlZm9yZUluY2x1ZGUgPSByZXN1bHQuc3Vic3RyaW5nKDAsIGluY2x1ZGVNYXRjaE9mZnNldCArIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoT2Zmc2V0KTtcblx0XHRsZXQgYWZ0ZXJJbmNsdWRlID0gcmVzdWx0LnN1YnN0cmluZyhpbmNsdWRlTWF0Y2hPZmZzZXQgKyBzY3JpcHRJbmNsdWRlLmluY2x1ZGVNYXRjaE9mZnNldCArIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoTGVuZ3RoKTtcblxuXHRcdGxldCBpbmNsdWRlVmFsdWU6IHN0cmluZyA9IFwiXCI7XG5cblx0XHRpZiAocHJvY2Vzc2VkU2NyaXB0c1tzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aF0pXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2coYFNjcmlwdCAke3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRofSBhbHJlYWR5IGluY2x1ZGVkYCk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRsZXQgY2hpbGRBbmNlc3RvcnMgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50U2NyaXB0QW5jZXN0b3JzKTtcblx0XHRcdGNoaWxkQW5jZXN0b3JzW2N1cnJlbnRTY3JpcHQuc2NyaXB0RmlsZVBhdGhdID0gdHJ1ZTtcblxuXHRcdFx0aW5jbHVkZVZhbHVlID0gYXdhaXQgaW5zZXJ0U29ydGVkSW5jbHVkZXMoc2NyaXB0SW5jbHVkZS5zY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgsIGNoaWxkQW5jZXN0b3JzLCBwcm9jZXNzZWRTY3JpcHRzLCBhbGxTY3JpcHRzKTtcblx0XHRcdGluY2x1ZGVWYWx1ZSA9IHNoYWRlck5ld0xpbmUgKyBpbmNsdWRlVmFsdWUgKyBzaGFkZXJOZXdMaW5lO1xuXG5cdFx0XHRwcm9jZXNzZWRTY3JpcHRzW3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoXSA9IHRydWVcblx0XHR9XG5cblx0XHRyZXN1bHQgPSBiZWZvcmVJbmNsdWRlICsgaW5jbHVkZVZhbHVlICsgYWZ0ZXJJbmNsdWRlO1xuXHRcdGluY2x1ZGVNYXRjaE9mZnNldCArPSAoaW5jbHVkZVZhbHVlLmxlbmd0aCAtIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoTGVuZ3RoKTtcblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmludGVyZmFjZSBJbmNsdWRlSW5mb1xue1xuXHRzY3JpcHQ6IFNjcmlwdEluZm87XG5cdGluY2x1ZGVNYXRjaE9mZnNldDogbnVtYmVyO1xuXHRpbmNsdWRlTWF0Y2hMZW5ndGg6IG51bWJlcjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U2NyaXB0SW5jbHVkZXMoXG5cdHNjcmlwdDogU2NyaXB0SW5mbyxcblx0cmVhZFNjcmlwdDogcmVhZFNjcmlwdCxcblx0cGF0aDogcGF0aCxcblx0YWxsU2NyaXB0czogU2NyaXB0TWFwKTogUHJvbWlzZTxJbmNsdWRlSW5mb1tdPlxue1xuXHRsZXQgaW5jbHVkZXM6IEluY2x1ZGVJbmZvW10gPSBbXTtcblxuXHRpZiAoKG51bGwgIT09IHNjcmlwdCkgJiYgKHVuZGVmaW5lZCAhPT0gc2NyaXB0KSlcblx0e1xuXHRcdGxldCByZWdleCA9IC9eXFwjcHJhZ21hIGluY2x1ZGUgXFxcIiguKilcXFwiJC9nbTtcblxuXHRcdGxldCBpbmNsdWRlTWF0Y2ggPSByZWdleC5leGVjKHNjcmlwdC5zY3JpcHQpO1xuXG5cdFx0d2hpbGUgKGluY2x1ZGVNYXRjaClcblx0XHR7XG5cdFx0XHRsZXQgcmVsYXRpdmVJbmNsdWRlRmlsZVBhdGggPSBpbmNsdWRlTWF0Y2hbMV07XG5cblx0XHRcdGxldCBpbmNsdWRlRmlsZVBhdGggPSBwYXRoLnJlc29sdmUoc2NyaXB0LnNjcmlwdEZvbGRlclBhdGgsIHJlbGF0aXZlSW5jbHVkZUZpbGVQYXRoKTtcblx0XHRcdGxldCBpbmNsdWRlRm9sZGVyUGF0aCA9IHBhdGguZGlybmFtZShpbmNsdWRlRmlsZVBhdGgpO1xuXHRcdFx0bGV0IGluY2x1ZGVGaWxlTmFtZSA9IHBhdGguYmFzZW5hbWUoaW5jbHVkZUZpbGVQYXRoKTtcblxuXHRcdFx0bGV0IGluY2x1ZGVTY3JpcHQgPSBhbGxTY3JpcHRzW2luY2x1ZGVGaWxlUGF0aF07XG5cblx0XHRcdGlmICgobnVsbCA9PT0gaW5jbHVkZVNjcmlwdCkgfHwgKHVuZGVmaW5lZCA9PT0gaW5jbHVkZVNjcmlwdCkpXG5cdFx0XHR7XG5cdFx0XHRcdGluY2x1ZGVTY3JpcHQgPVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNjcmlwdDogYXdhaXQgcmVhZFNoYWRlclNjcmlwdChpbmNsdWRlRmlsZVBhdGgsIHJlYWRTY3JpcHQpLFxuXHRcdFx0XHRcdFx0c2NyaXB0RmlsZVBhdGg6IGluY2x1ZGVGaWxlUGF0aCxcblx0XHRcdFx0XHRcdHNjcmlwdEZvbGRlclBhdGg6IGluY2x1ZGVGb2xkZXJQYXRoLFxuXHRcdFx0XHRcdFx0c2NyaXB0RmlsZU5hbWU6IGluY2x1ZGVGaWxlTmFtZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdGFsbFNjcmlwdHNbaW5jbHVkZUZpbGVQYXRoXSA9IGluY2x1ZGVTY3JpcHQ7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBpbmNsdWRlSW5mbzogSW5jbHVkZUluZm8gPVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2NyaXB0OiBpbmNsdWRlU2NyaXB0LFxuXHRcdFx0XHRcdGluY2x1ZGVNYXRjaE9mZnNldDogaW5jbHVkZU1hdGNoLmluZGV4LFxuXHRcdFx0XHRcdGluY2x1ZGVNYXRjaExlbmd0aDogaW5jbHVkZU1hdGNoWzBdLmxlbmd0aFxuXHRcdFx0XHR9O1xuXG5cdFx0XHRpbmNsdWRlcy5wdXNoKGluY2x1ZGVJbmZvKTtcblxuXHRcdFx0aW5jbHVkZU1hdGNoID0gcmVnZXguZXhlYyhzY3JpcHQuc2NyaXB0KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gaW5jbHVkZXM7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlYWRTaGFkZXJTY3JpcHQocGF0aDogc3RyaW5nLCByZWFkU2NyaXB0OiByZWFkU2NyaXB0KTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBzY3JpcHQgPSBhd2FpdCByZWFkU2NyaXB0KHBhdGgpO1xuXHRyZXR1cm4gZml4TGluZUVuZGluZ3Moc2NyaXB0KTtcbn1cblxuZnVuY3Rpb24gZml4TGluZUVuZGluZ3Moc291cmNlOiBzdHJpbmcpXG57XG5cdHJldHVybiBzb3VyY2UucmVwbGFjZShcIlxcclxcblwiLCBzaGFkZXJOZXdMaW5lKTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kTGluZShjdXJyZW50VmFsdWU6IHN0cmluZywgbGluZVRvQXBwZW5kOiBzdHJpbmcpOiBzdHJpbmdcbntcblx0aWYgKChudWxsID09PSBsaW5lVG9BcHBlbmQpIHx8ICh1bmRlZmluZWQgPT09IGxpbmVUb0FwcGVuZCkpXG5cdHtcblx0XHRyZXR1cm4gY3VycmVudFZhbHVlO1xuXHR9XG5cblx0cmV0dXJuIGN1cnJlbnRWYWx1ZSArIGxpbmVUb0FwcGVuZCArIHNoYWRlck5ld0xpbmU7XG59XG4iXX0=