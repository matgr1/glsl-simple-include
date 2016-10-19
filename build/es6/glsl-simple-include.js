"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const shaderNewLine = "\n";
function processIncludes(readScript, path, entryScriptPath, entryScript, preprocessorDefines) {
    return __awaiter(this, void 0, void 0, function* () {
        let entryFilePath = path.resolve(entryScriptPath);
        let entryFolderPath = path.dirname(entryFilePath);
        let entryFileName = path.basename(entryFilePath);
        if ((null === entryScript) || (undefined === entryScript)) {
            entryScript = yield readShaderScript(entryFilePath, readScript);
        }
        else {
            entryScript = fixLineEndings(entryScript);
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
        return result.trim();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xzbC1zaW1wbGUtaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nbHNsLXNpbXBsZS1pbmNsdWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQVNBLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQztBQUUzQix5QkFDQyxVQUFzQixFQUN0QixJQUFVLEVBQ1YsZUFBdUIsRUFDdkIsV0FBb0IsRUFDcEIsbUJBQThCOztRQUU5QixJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2xELElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbEQsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVqRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUMxRCxDQUFDO1lBQ0EsV0FBVyxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFDRCxJQUFJLENBQ0osQ0FBQztZQUNBLFdBQVcsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELE1BQU0sQ0FBQyxNQUFNLGFBQWEsQ0FDekI7WUFDQyxNQUFNLEVBQUUsV0FBVztZQUNuQixjQUFjLEVBQUUsYUFBYTtZQUM3QixnQkFBZ0IsRUFBRSxlQUFlO1lBQ2pDLGNBQWMsRUFBRSxhQUFhO1NBQzdCLEVBQ0QsVUFBVSxFQUNWLElBQUksRUFDSixtQkFBbUIsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7O0FBOUJxQix1QkFBZSxrQkE4QnBDLENBQUE7QUFVRCx1QkFDQyxXQUF1QixFQUN2QixVQUFzQixFQUN0QixJQUFVLEVBQ1YsbUJBQThCOztRQUU5QixnQkFB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dGg6IHN0cmluZykgPT4gUHJvbWlzZTxzdHJpbmc+O1xuXG5leHBvcnQgaW50ZXJmYWNlIHBhdGhcbntcblx0cmVzb2x2ZSguLi5wYXRoOiBzdHJpbmdbXSk6IHN0cmluZztcblx0ZGlybmFtZShwYXRoOiBzdHJpbmcpOiBzdHJpbmc7XG5cdGJhc2VuYW1lKHBhdGg6IHN0cmluZywgZXh0Pzogc3RyaW5nKTogc3RyaW5nO1xufVxuXG5jb25zdCBzaGFkZXJOZXdMaW5lID0gXCJcXG5cIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NJbmNsdWRlcyhcblx0cmVhZFNjcmlwdDogcmVhZFNjcmlwdCxcblx0cGF0aDogcGF0aCxcblx0ZW50cnlTY3JpcHRQYXRoOiBzdHJpbmcsXG5cdGVudHJ5U2NyaXB0Pzogc3RyaW5nLFxuXHRwcmVwcm9jZXNzb3JEZWZpbmVzPzogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz5cbntcblx0bGV0IGVudHJ5RmlsZVBhdGggPSBwYXRoLnJlc29sdmUoZW50cnlTY3JpcHRQYXRoKTtcblx0bGV0IGVudHJ5Rm9sZGVyUGF0aCA9IHBhdGguZGlybmFtZShlbnRyeUZpbGVQYXRoKTtcblx0bGV0IGVudHJ5RmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGVudHJ5RmlsZVBhdGgpO1xuXG5cdGlmICgobnVsbCA9PT0gZW50cnlTY3JpcHQpIHx8ICh1bmRlZmluZWQgPT09IGVudHJ5U2NyaXB0KSlcblx0e1xuXHRcdGVudHJ5U2NyaXB0ID0gYXdhaXQgcmVhZFNoYWRlclNjcmlwdChlbnRyeUZpbGVQYXRoLCByZWFkU2NyaXB0KTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRlbnRyeVNjcmlwdCA9IGZpeExpbmVFbmRpbmdzKGVudHJ5U2NyaXB0KTtcblx0fVxuXG5cdHJldHVybiBhd2FpdCBwcm9jZXNzU2NyaXB0KFxuXHRcdHtcblx0XHRcdHNjcmlwdDogZW50cnlTY3JpcHQsXG5cdFx0XHRzY3JpcHRGaWxlUGF0aDogZW50cnlGaWxlUGF0aCxcblx0XHRcdHNjcmlwdEZvbGRlclBhdGg6IGVudHJ5Rm9sZGVyUGF0aCxcblx0XHRcdHNjcmlwdEZpbGVOYW1lOiBlbnRyeUZpbGVOYW1lXG5cdFx0fSxcblx0XHRyZWFkU2NyaXB0LFxuXHRcdHBhdGgsXG5cdFx0cHJlcHJvY2Vzc29yRGVmaW5lcyk7XG59XG5cbmludGVyZmFjZSBTY3JpcHRJbmZvXG57XG5cdHNjcmlwdDogc3RyaW5nO1xuXHRzY3JpcHRGaWxlUGF0aDogc3RyaW5nO1xuXHRzY3JpcHRGb2xkZXJQYXRoOiBzdHJpbmc7XG5cdHNjcmlwdEZpbGVOYW1lOiBzdHJpbmc7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NTY3JpcHQoXG5cdGVudHJ5U2NyaXB0OiBTY3JpcHRJbmZvLFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRwcmVwcm9jZXNzb3JEZWZpbmVzPzogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz5cbntcblx0Ly8gc3RyaXAgdmVyc2lvblxuXHRsZXQgdmVyc2lvblN0cmluZzogc3RyaW5nID0gbnVsbDtcblxuXHRsZXQgdmVyc2lvblJlZ2V4ID0gL15cXHMqI3ZlcnNpb24gLiokL207XG5cdGxldCB2ZXJzaW9uTWF0Y2ggPSB2ZXJzaW9uUmVnZXguZXhlYyhlbnRyeVNjcmlwdC5zY3JpcHQpO1xuXG5cdGlmICgobnVsbCAhPT0gdmVyc2lvbk1hdGNoKSAmJiAodW5kZWZpbmVkICE9PSB2ZXJzaW9uTWF0Y2gpKVxuXHR7XG5cdFx0bGV0IGFmdGVyVmVyc2lvbkluZGV4ID0gdmVyc2lvbk1hdGNoLmluZGV4ICsgdmVyc2lvbk1hdGNoWzBdLmxlbmd0aDtcblxuXHRcdHZlcnNpb25TdHJpbmcgPSB2ZXJzaW9uTWF0Y2hbMF0udHJpbSgpO1xuXHRcdGVudHJ5U2NyaXB0LnNjcmlwdCA9IGVudHJ5U2NyaXB0LnNjcmlwdC5zdWJzdHIoYWZ0ZXJWZXJzaW9uSW5kZXgpO1xuXHR9XG5cblx0Ly8gYXBwZW5kIHZlcnNpb24gYW5kIHByZXByb2Nlc3NvciBtYWNyb3Ncblx0bGV0IHJlc3VsdCA9IFwiXCI7XG5cdHJlc3VsdCA9IGFwcGVuZExpbmUocmVzdWx0LCB2ZXJzaW9uU3RyaW5nKTtcblxuXHRpZiAoKG51bGwgIT09IHByZXByb2Nlc3NvckRlZmluZXMpICYmICh1bmRlZmluZWQgIT09IHByZXByb2Nlc3NvckRlZmluZXMpKVxuXHR7XG5cdFx0cHJlcHJvY2Vzc29yRGVmaW5lcy5mb3JFYWNoKFxuXHRcdFx0ZnVuY3Rpb24gKGRlZmluZSlcblx0XHRcdHtcblx0XHRcdFx0cmVzdWx0ID0gYXBwZW5kTGluZShyZXN1bHQsIGAjZGVmaW5lICR7ZGVmaW5lfWApO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvLyBidWlsZCB0aGUgc2NyaXB0XG5cdHJlc3VsdCA9IGF3YWl0IGJ1aWxkU2NyaXB0KHJlc3VsdCwgZW50cnlTY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgpO1xuXG5cdHJldHVybiByZXN1bHQudHJpbSgpO1xufVxuXG5pbnRlcmZhY2UgU2NyaXB0TWFwXG57XG5cdFtzY3JpcHRGaWxlUGF0aDogc3RyaW5nXTogU2NyaXB0SW5mb1xufVxuaW50ZXJmYWNlIFByb2Nlc3NlZFNjcmlwdE1hcFxue1xuXHRbc2NyaXB0RmlsZVBhdGg6IHN0cmluZ106IGJvb2xlYW5cbn1cblxuYXN5bmMgZnVuY3Rpb24gYnVpbGRTY3JpcHQocmVzdWx0OiBzdHJpbmcsIGVudHJ5U2NyaXB0OiBTY3JpcHRJbmZvLCByZWFkU2NyaXB0OiByZWFkU2NyaXB0LCBwYXRoOiBwYXRoKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBhbGxTY3JpcHRzOiBTY3JpcHRNYXAgPSB7fTtcblx0bGV0IHByb2Nlc3NlZFNjcmlwdHM6IFByb2Nlc3NlZFNjcmlwdE1hcCA9IHt9O1xuXHRsZXQgYW5jZXN0b3JzOiBQcm9jZXNzZWRTY3JpcHRNYXAgPSB7fTtcblxuXHRsZXQgZnVsbFNjcmlwdCA9IGF3YWl0IGluc2VydFNvcnRlZEluY2x1ZGVzKGVudHJ5U2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoLCBhbmNlc3RvcnMsIHByb2Nlc3NlZFNjcmlwdHMsIGFsbFNjcmlwdHMpO1xuXG5cdHJlc3VsdCA9IGFwcGVuZExpbmUocmVzdWx0LCBmdWxsU2NyaXB0KTtcblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbnNlcnRTb3J0ZWRJbmNsdWRlcyhcblx0Y3VycmVudFNjcmlwdDogU2NyaXB0SW5mbyxcblx0cmVhZFNjcmlwdDogcmVhZFNjcmlwdCxcblx0cGF0aDogcGF0aCxcblx0Y3VycmVudFNjcmlwdEFuY2VzdG9yczogUHJvY2Vzc2VkU2NyaXB0TWFwLFxuXHRwcm9jZXNzZWRTY3JpcHRzOiBQcm9jZXNzZWRTY3JpcHRNYXAsXG5cdGFsbFNjcmlwdHM6IFNjcmlwdE1hcCk6IFByb21pc2U8c3RyaW5nPlxue1xuXHRsZXQgc2NyaXB0SW5jbHVkZXMgPSBhd2FpdCBnZXRTY3JpcHRJbmNsdWRlcyhjdXJyZW50U2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoLCBhbGxTY3JpcHRzKTtcblxuXHRsZXQgcmVzdWx0ID0gY3VycmVudFNjcmlwdC5zY3JpcHQ7XG5cblx0bGV0IGluY2x1ZGVNYXRjaE9mZnNldCA9IDA7XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzY3JpcHRJbmNsdWRlcy5sZW5ndGg7IGkrKylcblx0e1xuXHRcdGxldCBzY3JpcHRJbmNsdWRlID0gc2NyaXB0SW5jbHVkZXNbaV07XG5cblx0XHRpZiAoY3VycmVudFNjcmlwdEFuY2VzdG9yc1tzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aF0pXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ3ljbGUgZGV0ZWN0ZWRcIik7XG5cdFx0fVxuXHRcdGlmIChzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aCA9PT0gY3VycmVudFNjcmlwdC5zY3JpcHRGaWxlUGF0aClcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBdHRlbXB0IHRvIGluY2x1ZGUgc2VsZlwiKTtcblx0XHR9XG5cblx0XHRsZXQgYmVmb3JlSW5jbHVkZSA9IHJlc3VsdC5zdWJzdHJpbmcoMCwgaW5jbHVkZU1hdGNoT2Zmc2V0ICsgc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hPZmZzZXQpO1xuXHRcdGxldCBhZnRlckluY2x1ZGUgPSByZXN1bHQuc3Vic3RyaW5nKGluY2x1ZGVNYXRjaE9mZnNldCArIHNjcmlwdEluY2x1ZGUuaW5jbHVkZU1hdGNoT2Zmc2V0ICsgc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hMZW5ndGgpO1xuXG5cdFx0bGV0IGluY2x1ZGVWYWx1ZTogc3RyaW5nID0gXCJcIjtcblxuXHRcdGlmIChwcm9jZXNzZWRTY3JpcHRzW3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoXSlcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyhgU2NyaXB0ICR7c2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGh9IGFscmVhZHkgaW5jbHVkZWRgKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxldCBjaGlsZEFuY2VzdG9ycyA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRTY3JpcHRBbmNlc3RvcnMpO1xuXHRcdFx0Y2hpbGRBbmNlc3RvcnNbY3VycmVudFNjcmlwdC5zY3JpcHRGaWxlUGF0aF0gPSB0cnVlO1xuXG5cdFx0XHRpbmNsdWRlVmFsdWUgPSBhd2FpdCBpbnNlcnRTb3J0ZWRJbmNsdWRlcyhzY3JpcHRJbmNsdWRlLnNjcmlwdCwgcmVhZFNjcmlwdCwgcGF0aCwgY2hpbGRBbmNlc3RvcnMsIHByb2Nlc3NlZFNjcmlwdHMsIGFsbFNjcmlwdHMpO1xuXHRcdFx0aW5jbHVkZVZhbHVlID0gc2hhZGVyTmV3TGluZSArIGluY2x1ZGVWYWx1ZSArIHNoYWRlck5ld0xpbmU7XG5cblx0XHRcdHByb2Nlc3NlZFNjcmlwdHNbc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGhdID0gdHJ1ZVxuXHRcdH1cblxuXHRcdHJlc3VsdCA9IGJlZm9yZUluY2x1ZGUgKyBpbmNsdWRlVmFsdWUgKyBhZnRlckluY2x1ZGU7XG5cdFx0aW5jbHVkZU1hdGNoT2Zmc2V0ICs9IChpbmNsdWRlVmFsdWUubGVuZ3RoIC0gc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hMZW5ndGgpO1xuXHR9XG5cblx0cmV0dXJuIHJlc3VsdDtcbn1cblxuaW50ZXJmYWNlIEluY2x1ZGVJbmZvXG57XG5cdHNjcmlwdDogU2NyaXB0SW5mbztcblx0aW5jbHVkZU1hdGNoT2Zmc2V0OiBudW1iZXI7XG5cdGluY2x1ZGVNYXRjaExlbmd0aDogbnVtYmVyO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRTY3JpcHRJbmNsdWRlcyhcblx0c2NyaXB0OiBTY3JpcHRJbmZvLFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRhbGxTY3JpcHRzOiBTY3JpcHRNYXApOiBQcm9taXNlPEluY2x1ZGVJbmZvW10+XG57XG5cdGxldCBpbmNsdWRlczogSW5jbHVkZUluZm9bXSA9IFtdO1xuXG5cdGlmICgobnVsbCAhPT0gc2NyaXB0KSAmJiAodW5kZWZpbmVkICE9PSBzY3JpcHQpKVxuXHR7XG5cdFx0bGV0IHJlZ2V4ID0gL15cXCNwcmFnbWEgaW5jbHVkZSBcXFwiKC4qKVxcXCIkL2dtO1xuXG5cdFx0bGV0IGluY2x1ZGVNYXRjaCA9IHJlZ2V4LmV4ZWMoc2NyaXB0LnNjcmlwdCk7XG5cblx0XHR3aGlsZSAoaW5jbHVkZU1hdGNoKVxuXHRcdHtcblx0XHRcdGxldCByZWxhdGl2ZUluY2x1ZGVGaWxlUGF0aCA9IGluY2x1ZGVNYXRjaFsxXTtcblxuXHRcdFx0bGV0IGluY2x1ZGVGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShzY3JpcHQuc2NyaXB0Rm9sZGVyUGF0aCwgcmVsYXRpdmVJbmNsdWRlRmlsZVBhdGgpO1xuXHRcdFx0bGV0IGluY2x1ZGVGb2xkZXJQYXRoID0gcGF0aC5kaXJuYW1lKGluY2x1ZGVGaWxlUGF0aCk7XG5cdFx0XHRsZXQgaW5jbHVkZUZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShpbmNsdWRlRmlsZVBhdGgpO1xuXG5cdFx0XHRsZXQgaW5jbHVkZVNjcmlwdCA9IGFsbFNjcmlwdHNbaW5jbHVkZUZpbGVQYXRoXTtcblxuXHRcdFx0aWYgKChudWxsID09PSBpbmNsdWRlU2NyaXB0KSB8fCAodW5kZWZpbmVkID09PSBpbmNsdWRlU2NyaXB0KSlcblx0XHRcdHtcblx0XHRcdFx0aW5jbHVkZVNjcmlwdCA9XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2NyaXB0OiBhd2FpdCByZWFkU2hhZGVyU2NyaXB0KGluY2x1ZGVGaWxlUGF0aCwgcmVhZFNjcmlwdCksXG5cdFx0XHRcdFx0XHRzY3JpcHRGaWxlUGF0aDogaW5jbHVkZUZpbGVQYXRoLFxuXHRcdFx0XHRcdFx0c2NyaXB0Rm9sZGVyUGF0aDogaW5jbHVkZUZvbGRlclBhdGgsXG5cdFx0XHRcdFx0XHRzY3JpcHRGaWxlTmFtZTogaW5jbHVkZUZpbGVOYW1lXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0YWxsU2NyaXB0c1tpbmNsdWRlRmlsZVBhdGhdID0gaW5jbHVkZVNjcmlwdDtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGluY2x1ZGVJbmZvOiBJbmNsdWRlSW5mbyA9XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzY3JpcHQ6IGluY2x1ZGVTY3JpcHQsXG5cdFx0XHRcdFx0aW5jbHVkZU1hdGNoT2Zmc2V0OiBpbmNsdWRlTWF0Y2guaW5kZXgsXG5cdFx0XHRcdFx0aW5jbHVkZU1hdGNoTGVuZ3RoOiBpbmNsdWRlTWF0Y2hbMF0ubGVuZ3RoXG5cdFx0XHRcdH07XG5cblx0XHRcdGluY2x1ZGVzLnB1c2goaW5jbHVkZUluZm8pO1xuXG5cdFx0XHRpbmNsdWRlTWF0Y2ggPSByZWdleC5leGVjKHNjcmlwdC5zY3JpcHQpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBpbmNsdWRlcztcbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVhZFNoYWRlclNjcmlwdChwYXRoOiBzdHJpbmcsIHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQpOiBQcm9taXNlPHN0cmluZz5cbntcblx0bGV0IHNjcmlwdCA9IGF3YWl0IHJlYWRTY3JpcHQocGF0aCk7XG5cdHJldHVybiBmaXhMaW5lRW5kaW5ncyhzY3JpcHQpO1xufVxuXG5mdW5jdGlvbiBmaXhMaW5lRW5kaW5ncyhzb3VyY2U6IHN0cmluZylcbntcblx0cmV0dXJuIHNvdXJjZS5yZXBsYWNlKFwiXFxyXFxuXCIsIHNoYWRlck5ld0xpbmUpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRMaW5lKGN1cnJlbnRWYWx1ZTogc3RyaW5nLCBsaW5lVG9BcHBlbmQ6IHN0cmluZyk6IHN0cmluZ1xue1xuXHRpZiAoKG51bGwgPT09IGxpbmVUb0FwcGVuZCkgfHwgKHVuZGVmaW5lZCA9PT0gbGluZVRvQXBwZW5kKSlcblx0e1xuXHRcdHJldHVybiBjdXJyZW50VmFsdWU7XG5cdH1cblxuXHRyZXR1cm4gY3VycmVudFZhbHVlICsgbGluZVRvQXBwZW5kICsgc2hhZGVyTmV3TGluZTtcbn1cbiJdfQ==