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
        else {
            entryScript = fixScript(entryScript);
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
        return fixScript(script);
    });
}
function fixScript(source) {
    return fixLineEndings(stripBom(source));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xzbC1zaW1wbGUtaW5jbHVkZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9nbHNsLXNpbXBsZS1pbmNsdWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUNBLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztBQVdwQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFFM0IseUJBQ0MsVUFBc0IsRUFDdEIsSUFBVSxFQUNWLGVBQXVCLEVBQ3ZCLFdBQW9CLEVBQ3BCLG1CQUE4Qjs7UUFFOUIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNsRCxJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2xELElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFakQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FDMUQsQ0FBQztZQUNBLFdBQVcsR0FBRyxNQUFNLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBQ0QsSUFBSSxDQUNKLENBQUM7WUFDQSxXQUFXLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxNQUFNLENBQUMsTUFBTSxhQUFhLENBQ3pCO1lBQ0MsTUFBTSxFQUFFLFdBQVc7WUFDbkIsY0FBYyxFQUFFLGFBQWE7WUFDN0IsZ0JBQWdCLEVBQUUsZUFBZTtZQUNqQyxjQUFjLEVBQUUsYUFBYTtTQUM3QixFQUNELFVBQVUsRUFDVixJQUFJLEVBQ0osbUJBQW1CLENBQUMsQ0FBQztJQUN2QixDQUFDOztBQTlCcUIsdUJBQWUsa0JBOEJwQyxDQUFBO0FBVUQsdUJBQ0MsV0FBdUIs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Q0FBQyxZQUFZLENBQUM7SUFDckIsQ0FBQztJQUVELE1BQU0sQ0FBQyxZQUFZLEdBQUcsWUFBWSxHQUFHLGFBQWEsQ0FBQztBQUNwRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiZGVjbGFyZSBsZXQgcmVxdWlyZTogYW55O1xubGV0IHN0cmlwQm9tID0gcmVxdWlyZShcInN0cmlwLWJvbVwiKTtcblxuZXhwb3J0IHR5cGUgcmVhZFNjcmlwdCA9IChwYXRoOiBzdHJpbmcpID0+IFByb21pc2U8c3RyaW5nPjtcblxuZXhwb3J0IGludGVyZmFjZSBwYXRoXG57XG5cdHJlc29sdmUoLi4ucGF0aDogc3RyaW5nW10pOiBzdHJpbmc7XG5cdGRpcm5hbWUocGF0aDogc3RyaW5nKTogc3RyaW5nO1xuXHRiYXNlbmFtZShwYXRoOiBzdHJpbmcsIGV4dD86IHN0cmluZyk6IHN0cmluZztcbn1cblxuY29uc3Qgc2hhZGVyTmV3TGluZSA9IFwiXFxuXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9jZXNzSW5jbHVkZXMoXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXG5cdHBhdGg6IHBhdGgsXG5cdGVudHJ5U2NyaXB0UGF0aDogc3RyaW5nLFxuXHRlbnRyeVNjcmlwdD86IHN0cmluZyxcblx0cHJlcHJvY2Vzc29yRGVmaW5lcz86IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBlbnRyeUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGVudHJ5U2NyaXB0UGF0aCk7XG5cdGxldCBlbnRyeUZvbGRlclBhdGggPSBwYXRoLmRpcm5hbWUoZW50cnlGaWxlUGF0aCk7XG5cdGxldCBlbnRyeUZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShlbnRyeUZpbGVQYXRoKTtcblxuXHRpZiAoKG51bGwgPT09IGVudHJ5U2NyaXB0KSB8fCAodW5kZWZpbmVkID09PSBlbnRyeVNjcmlwdCkpXG5cdHtcblx0XHRlbnRyeVNjcmlwdCA9IGF3YWl0IHJlYWRTaGFkZXJTY3JpcHQoZW50cnlGaWxlUGF0aCwgcmVhZFNjcmlwdCk7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0ZW50cnlTY3JpcHQgPSBmaXhTY3JpcHQoZW50cnlTY3JpcHQpO1xuXHR9XG5cblx0cmV0dXJuIGF3YWl0IHByb2Nlc3NTY3JpcHQoXG5cdFx0e1xuXHRcdFx0c2NyaXB0OiBlbnRyeVNjcmlwdCxcblx0XHRcdHNjcmlwdEZpbGVQYXRoOiBlbnRyeUZpbGVQYXRoLFxuXHRcdFx0c2NyaXB0Rm9sZGVyUGF0aDogZW50cnlGb2xkZXJQYXRoLFxuXHRcdFx0c2NyaXB0RmlsZU5hbWU6IGVudHJ5RmlsZU5hbWVcblx0XHR9LFxuXHRcdHJlYWRTY3JpcHQsXG5cdFx0cGF0aCxcblx0XHRwcmVwcm9jZXNzb3JEZWZpbmVzKTtcbn1cblxuaW50ZXJmYWNlIFNjcmlwdEluZm9cbntcblx0c2NyaXB0OiBzdHJpbmc7XG5cdHNjcmlwdEZpbGVQYXRoOiBzdHJpbmc7XG5cdHNjcmlwdEZvbGRlclBhdGg6IHN0cmluZztcblx0c2NyaXB0RmlsZU5hbWU6IHN0cmluZztcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc1NjcmlwdChcblx0ZW50cnlTY3JpcHQ6IFNjcmlwdEluZm8sXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXG5cdHBhdGg6IHBhdGgsXG5cdHByZXByb2Nlc3NvckRlZmluZXM/OiBzdHJpbmdbXSk6IFByb21pc2U8c3RyaW5nPlxue1xuXHQvLyBzdHJpcCB2ZXJzaW9uXG5cdGxldCB2ZXJzaW9uU3RyaW5nOiBzdHJpbmcgPSBudWxsO1xuXG5cdGxldCB2ZXJzaW9uUmVnZXggPSAvXlxccyojdmVyc2lvbiAuKiQvbTtcblx0bGV0IHZlcnNpb25NYXRjaCA9IHZlcnNpb25SZWdleC5leGVjKGVudHJ5U2NyaXB0LnNjcmlwdCk7XG5cblx0aWYgKChudWxsICE9PSB2ZXJzaW9uTWF0Y2gpICYmICh1bmRlZmluZWQgIT09IHZlcnNpb25NYXRjaCkpXG5cdHtcblx0XHRsZXQgYWZ0ZXJWZXJzaW9uSW5kZXggPSB2ZXJzaW9uTWF0Y2guaW5kZXggKyB2ZXJzaW9uTWF0Y2hbMF0ubGVuZ3RoO1xuXG5cdFx0dmVyc2lvblN0cmluZyA9IHZlcnNpb25NYXRjaFswXS50cmltKCk7XG5cdFx0ZW50cnlTY3JpcHQuc2NyaXB0ID0gZW50cnlTY3JpcHQuc2NyaXB0LnN1YnN0cihhZnRlclZlcnNpb25JbmRleCk7XG5cdH1cblxuXHQvLyBhcHBlbmQgdmVyc2lvbiBhbmQgcHJlcHJvY2Vzc29yIG1hY3Jvc1xuXHRsZXQgcmVzdWx0ID0gXCJcIjtcblx0cmVzdWx0ID0gYXBwZW5kTGluZShyZXN1bHQsIHZlcnNpb25TdHJpbmcpO1xuXG5cdGlmICgobnVsbCAhPT0gcHJlcHJvY2Vzc29yRGVmaW5lcykgJiYgKHVuZGVmaW5lZCAhPT0gcHJlcHJvY2Vzc29yRGVmaW5lcykpXG5cdHtcblx0XHRwcmVwcm9jZXNzb3JEZWZpbmVzLmZvckVhY2goXG5cdFx0XHRmdW5jdGlvbiAoZGVmaW5lKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXN1bHQgPSBhcHBlbmRMaW5lKHJlc3VsdCwgYCNkZWZpbmUgJHtkZWZpbmV9YCk7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8vIGJ1aWxkIHRoZSBzY3JpcHRcblx0cmVzdWx0ID0gYXdhaXQgYnVpbGRTY3JpcHQocmVzdWx0LCBlbnRyeVNjcmlwdCwgcmVhZFNjcmlwdCwgcGF0aCk7XG5cblx0cmV0dXJuIHJlc3VsdC50cmltKCk7XG59XG5cbmludGVyZmFjZSBTY3JpcHRNYXBcbntcblx0W3NjcmlwdEZpbGVQYXRoOiBzdHJpbmddOiBTY3JpcHRJbmZvXG59XG5pbnRlcmZhY2UgUHJvY2Vzc2VkU2NyaXB0TWFwXG57XG5cdFtzY3JpcHRGaWxlUGF0aDogc3RyaW5nXTogYm9vbGVhblxufVxuXG5hc3luYyBmdW5jdGlvbiBidWlsZFNjcmlwdChyZXN1bHQ6IHN0cmluZywgZW50cnlTY3JpcHQ6IFNjcmlwdEluZm8sIHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsIHBhdGg6IHBhdGgpOiBQcm9taXNlPHN0cmluZz5cbntcblx0bGV0IGFsbFNjcmlwdHM6IFNjcmlwdE1hcCA9IHt9O1xuXHRsZXQgcHJvY2Vzc2VkU2NyaXB0czogUHJvY2Vzc2VkU2NyaXB0TWFwID0ge307XG5cdGxldCBhbmNlc3RvcnM6IFByb2Nlc3NlZFNjcmlwdE1hcCA9IHt9O1xuXG5cdGxldCBmdWxsU2NyaXB0ID0gYXdhaXQgaW5zZXJ0U29ydGVkSW5jbHVkZXMoZW50cnlTY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgsIGFuY2VzdG9ycywgcHJvY2Vzc2VkU2NyaXB0cywgYWxsU2NyaXB0cyk7XG5cblx0cmVzdWx0ID0gYXBwZW5kTGluZShyZXN1bHQsIGZ1bGxTY3JpcHQpO1xuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluc2VydFNvcnRlZEluY2x1ZGVzKFxuXHRjdXJyZW50U2NyaXB0OiBTY3JpcHRJbmZvLFxuXHRyZWFkU2NyaXB0OiByZWFkU2NyaXB0LFxuXHRwYXRoOiBwYXRoLFxuXHRjdXJyZW50U2NyaXB0QW5jZXN0b3JzOiBQcm9jZXNzZWRTY3JpcHRNYXAsXG5cdHByb2Nlc3NlZFNjcmlwdHM6IFByb2Nlc3NlZFNjcmlwdE1hcCxcblx0YWxsU2NyaXB0czogU2NyaXB0TWFwKTogUHJvbWlzZTxzdHJpbmc+XG57XG5cdGxldCBzY3JpcHRJbmNsdWRlcyA9IGF3YWl0IGdldFNjcmlwdEluY2x1ZGVzKGN1cnJlbnRTY3JpcHQsIHJlYWRTY3JpcHQsIHBhdGgsIGFsbFNjcmlwdHMpO1xuXG5cdGxldCByZXN1bHQgPSBjdXJyZW50U2NyaXB0LnNjcmlwdDtcblxuXHRsZXQgaW5jbHVkZU1hdGNoT2Zmc2V0ID0gMDtcblxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHNjcmlwdEluY2x1ZGVzLmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0bGV0IHNjcmlwdEluY2x1ZGUgPSBzY3JpcHRJbmNsdWRlc1tpXTtcblxuXHRcdGlmIChjdXJyZW50U2NyaXB0QW5jZXN0b3JzW3NjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoXSlcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDeWNsZSBkZXRlY3RlZFwiKTtcblx0XHR9XG5cdFx0aWYgKHNjcmlwdEluY2x1ZGUuc2NyaXB0LnNjcmlwdEZpbGVQYXRoID09PSBjdXJyZW50U2NyaXB0LnNjcmlwdEZpbGVQYXRoKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkF0dGVtcHQgdG8gaW5jbHVkZSBzZWxmXCIpO1xuXHRcdH1cblxuXHRcdGxldCBiZWZvcmVJbmNsdWRlID0gcmVzdWx0LnN1YnN0cmluZygwLCBpbmNsdWRlTWF0Y2hPZmZzZXQgKyBzY3JpcHRJbmNsdWRlLmluY2x1ZGVNYXRjaE9mZnNldCk7XG5cdFx0bGV0IGFmdGVySW5jbHVkZSA9IHJlc3VsdC5zdWJzdHJpbmcoaW5jbHVkZU1hdGNoT2Zmc2V0ICsgc2NyaXB0SW5jbHVkZS5pbmNsdWRlTWF0Y2hPZmZzZXQgKyBzY3JpcHRJbmNsdWRlLmluY2x1ZGVNYXRjaExlbmd0aCk7XG5cblx0XHRsZXQgaW5jbHVkZVZhbHVlOiBzdHJpbmcgPSBcIlwiO1xuXG5cdFx0aWYgKHByb2Nlc3NlZFNjcmlwdHNbc2NyaXB0SW5jbHVkZS5zY3JpcHQuc2NyaXB0RmlsZVBhdGhdKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKGBTY3JpcHQgJHtzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aH0gYWxyZWFkeSBpbmNsdWRlZGApO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bGV0IGNoaWxkQW5jZXN0b3JzID0gT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFNjcmlwdEFuY2VzdG9ycyk7XG5cdFx0XHRjaGlsZEFuY2VzdG9yc1tjdXJyZW50U2NyaXB0LnNjcmlwdEZpbGVQYXRoXSA9IHRydWU7XG5cblx0XHRcdGluY2x1ZGVWYWx1ZSA9IGF3YWl0IGluc2VydFNvcnRlZEluY2x1ZGVzKHNjcmlwdEluY2x1ZGUuc2NyaXB0LCByZWFkU2NyaXB0LCBwYXRoLCBjaGlsZEFuY2VzdG9ycywgcHJvY2Vzc2VkU2NyaXB0cywgYWxsU2NyaXB0cyk7XG5cdFx0XHRpbmNsdWRlVmFsdWUgPSBzaGFkZXJOZXdMaW5lICsgaW5jbHVkZVZhbHVlICsgc2hhZGVyTmV3TGluZTtcblxuXHRcdFx0cHJvY2Vzc2VkU2NyaXB0c1tzY3JpcHRJbmNsdWRlLnNjcmlwdC5zY3JpcHRGaWxlUGF0aF0gPSB0cnVlXG5cdFx0fVxuXG5cdFx0cmVzdWx0ID0gYmVmb3JlSW5jbHVkZSArIGluY2x1ZGVWYWx1ZSArIGFmdGVySW5jbHVkZTtcblx0XHRpbmNsdWRlTWF0Y2hPZmZzZXQgKz0gKGluY2x1ZGVWYWx1ZS5sZW5ndGggLSBzY3JpcHRJbmNsdWRlLmluY2x1ZGVNYXRjaExlbmd0aCk7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5pbnRlcmZhY2UgSW5jbHVkZUluZm9cbntcblx0c2NyaXB0OiBTY3JpcHRJbmZvO1xuXHRpbmNsdWRlTWF0Y2hPZmZzZXQ6IG51bWJlcjtcblx0aW5jbHVkZU1hdGNoTGVuZ3RoOiBudW1iZXI7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNjcmlwdEluY2x1ZGVzKFxuXHRzY3JpcHQ6IFNjcmlwdEluZm8sXG5cdHJlYWRTY3JpcHQ6IHJlYWRTY3JpcHQsXG5cdHBhdGg6IHBhdGgsXG5cdGFsbFNjcmlwdHM6IFNjcmlwdE1hcCk6IFByb21pc2U8SW5jbHVkZUluZm9bXT5cbntcblx0bGV0IGluY2x1ZGVzOiBJbmNsdWRlSW5mb1tdID0gW107XG5cblx0aWYgKChudWxsICE9PSBzY3JpcHQpICYmICh1bmRlZmluZWQgIT09IHNjcmlwdCkpXG5cdHtcblx0XHRsZXQgcmVnZXggPSAvXlxcI3ByYWdtYSBpbmNsdWRlIFxcXCIoLiopXFxcIiQvZ207XG5cblx0XHRsZXQgaW5jbHVkZU1hdGNoID0gcmVnZXguZXhlYyhzY3JpcHQuc2NyaXB0KTtcblxuXHRcdHdoaWxlIChpbmNsdWRlTWF0Y2gpXG5cdFx0e1xuXHRcdFx0bGV0IHJlbGF0aXZlSW5jbHVkZUZpbGVQYXRoID0gaW5jbHVkZU1hdGNoWzFdO1xuXG5cdFx0XHRsZXQgaW5jbHVkZUZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKHNjcmlwdC5zY3JpcHRGb2xkZXJQYXRoLCByZWxhdGl2ZUluY2x1ZGVGaWxlUGF0aCk7XG5cdFx0XHRsZXQgaW5jbHVkZUZvbGRlclBhdGggPSBwYXRoLmRpcm5hbWUoaW5jbHVkZUZpbGVQYXRoKTtcblx0XHRcdGxldCBpbmNsdWRlRmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGluY2x1ZGVGaWxlUGF0aCk7XG5cblx0XHRcdGxldCBpbmNsdWRlU2NyaXB0ID0gYWxsU2NyaXB0c1tpbmNsdWRlRmlsZVBhdGhdO1xuXG5cdFx0XHRpZiAoKG51bGwgPT09IGluY2x1ZGVTY3JpcHQpIHx8ICh1bmRlZmluZWQgPT09IGluY2x1ZGVTY3JpcHQpKVxuXHRcdFx0e1xuXHRcdFx0XHRpbmNsdWRlU2NyaXB0ID1cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzY3JpcHQ6IGF3YWl0IHJlYWRTaGFkZXJTY3JpcHQoaW5jbHVkZUZpbGVQYXRoLCByZWFkU2NyaXB0KSxcblx0XHRcdFx0XHRcdHNjcmlwdEZpbGVQYXRoOiBpbmNsdWRlRmlsZVBhdGgsXG5cdFx0XHRcdFx0XHRzY3JpcHRGb2xkZXJQYXRoOiBpbmNsdWRlRm9sZGVyUGF0aCxcblx0XHRcdFx0XHRcdHNjcmlwdEZpbGVOYW1lOiBpbmNsdWRlRmlsZU5hbWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRhbGxTY3JpcHRzW2luY2x1ZGVGaWxlUGF0aF0gPSBpbmNsdWRlU2NyaXB0O1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgaW5jbHVkZUluZm86IEluY2x1ZGVJbmZvID1cblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNjcmlwdDogaW5jbHVkZVNjcmlwdCxcblx0XHRcdFx0XHRpbmNsdWRlTWF0Y2hPZmZzZXQ6IGluY2x1ZGVNYXRjaC5pbmRleCxcblx0XHRcdFx0XHRpbmNsdWRlTWF0Y2hMZW5ndGg6IGluY2x1ZGVNYXRjaFswXS5sZW5ndGhcblx0XHRcdFx0fTtcblxuXHRcdFx0aW5jbHVkZXMucHVzaChpbmNsdWRlSW5mbyk7XG5cblx0XHRcdGluY2x1ZGVNYXRjaCA9IHJlZ2V4LmV4ZWMoc2NyaXB0LnNjcmlwdCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGluY2x1ZGVzO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkU2hhZGVyU2NyaXB0KHBhdGg6IHN0cmluZywgcmVhZFNjcmlwdDogcmVhZFNjcmlwdCk6IFByb21pc2U8c3RyaW5nPlxue1xuXHRsZXQgc2NyaXB0ID0gYXdhaXQgcmVhZFNjcmlwdChwYXRoKTtcblx0cmV0dXJuIGZpeFNjcmlwdChzY3JpcHQpO1xufVxuXG5mdW5jdGlvbiBmaXhTY3JpcHQoc291cmNlOiBzdHJpbmcpXG57XG5cdHJldHVybiBmaXhMaW5lRW5kaW5ncyhzdHJpcEJvbShzb3VyY2UpKTtcbn1cblxuZnVuY3Rpb24gZml4TGluZUVuZGluZ3Moc291cmNlOiBzdHJpbmcpXG57XG5cdHJldHVybiBzb3VyY2UucmVwbGFjZShcIlxcclxcblwiLCBzaGFkZXJOZXdMaW5lKTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kTGluZShjdXJyZW50VmFsdWU6IHN0cmluZywgbGluZVRvQXBwZW5kOiBzdHJpbmcpOiBzdHJpbmdcbntcblx0aWYgKChudWxsID09PSBsaW5lVG9BcHBlbmQpIHx8ICh1bmRlZmluZWQgPT09IGxpbmVUb0FwcGVuZCkpXG5cdHtcblx0XHRyZXR1cm4gY3VycmVudFZhbHVlO1xuXHR9XG5cblx0cmV0dXJuIGN1cnJlbnRWYWx1ZSArIGxpbmVUb0FwcGVuZCArIHNoYWRlck5ld0xpbmU7XG59XG4iXX0=