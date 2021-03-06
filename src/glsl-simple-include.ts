export type readScript = (path: string) => Promise<string>;

export interface path
{
	resolve(...path: string[]): string;
	dirname(path: string): string;
	basename(path: string, ext?: string): string;
}

const shaderNewLine = "\n";

export async function processIncludes(
	readScript: readScript,
	path: path,
	entryScriptPath: string,
	entryScript?: string,
	preprocessorDefines?: string[],
	onDependencyLoaded?: (dependencyPath: string) => void): Promise<string>
{
	let entryFilePath = path.resolve(entryScriptPath);
	let entryFolderPath = path.dirname(entryFilePath);
	let entryFileName = path.basename(entryFilePath);

	if (nullOrUndefined(entryScript))
	{
		entryScript = await readShaderScript(entryFilePath, readScript);
		onDependencyLoaded(entryFilePath);
	}
	else
	{
		entryScript = fixLineEndings(entryScript);
	}

	return await processScript(
		{
			script: entryScript,
			scriptFilePath: entryFilePath,
			scriptFolderPath: entryFolderPath,
			scriptFileName: entryFileName
		},
		readScript,
		path,
		preprocessorDefines,
		onDependencyLoaded);
}

interface ScriptInfo
{
	script: string;
	scriptFilePath: string;
	scriptFolderPath: string;
	scriptFileName: string;
}

async function processScript(
	entryScript: ScriptInfo,
	readScript: readScript,
	path: path,
	preprocessorDefines: string[],
	onDependencyLoaded: (dependencyPath: string) => void): Promise<string>
{
	// strip version
	let versionString: string = null;

	let versionRegex = /^\s*#version .*$/m;
	let versionMatch = versionRegex.exec(entryScript.script);

	if (hasValue(versionMatch))
	{
		let afterVersionIndex = versionMatch.index + versionMatch[0].length;

		versionString = versionMatch[0].trim();
		entryScript.script = entryScript.script.substr(afterVersionIndex);
	}

	// append version and preprocessor macros
	let result = "";
	result = appendLine(result, versionString);

	if (hasValue(preprocessorDefines))
	{
		preprocessorDefines.forEach(
			function (define)
			{
				result = appendLine(result, `#define ${define}`);
			});
	}

	// build the script
	result = await buildScript(result, entryScript, readScript, path, onDependencyLoaded);

	return result.trim();
}

interface ScriptMap
{
	[scriptFilePath: string]: ScriptInfo
}
interface ProcessedScriptMap
{
	[scriptFilePath: string]: boolean
}

async function buildScript(
	result: string,
	entryScript: ScriptInfo,
	readScript: readScript,
	path: path,
	onDependencyLoaded: (dependencyPath: string) => void): Promise<string>
{
	let allScripts: ScriptMap = {};
	let processedScripts: ProcessedScriptMap = {};
	let ancestors: ProcessedScriptMap = {};

	let fullScript = await insertSortedIncludes(entryScript, readScript, path, ancestors, processedScripts, allScripts, onDependencyLoaded);

	result = appendLine(result, fullScript);

	return result;
}

async function insertSortedIncludes(
	currentScript: ScriptInfo,
	readScript: readScript,
	path: path,
	currentScriptAncestors: ProcessedScriptMap,
	processedScripts: ProcessedScriptMap,
	allScripts: ScriptMap,
	onDependencyLoaded: (dependencyPath: string) => void): Promise<string>
{
	let scriptIncludes = await getScriptIncludes(currentScript, readScript, path, allScripts, onDependencyLoaded);

	let result = currentScript.script;

	let includeMatchOffset = 0;

	for (let i = 0; i < scriptIncludes.length; i++)
	{
		let scriptInclude = scriptIncludes[i];

		if (currentScriptAncestors[scriptInclude.script.scriptFilePath])
		{
			throw new Error("Cycle detected");
		}
		if (scriptInclude.script.scriptFilePath === currentScript.scriptFilePath)
		{
			throw new Error("Attempt to include self");
		}

		let beforeInclude = result.substring(0, includeMatchOffset + scriptInclude.includeMatchOffset);
		let afterInclude = result.substring(includeMatchOffset + scriptInclude.includeMatchOffset + scriptInclude.includeMatchLength);

		let includeValue: string = "";

		if (!processedScripts[scriptInclude.script.scriptFilePath])
		{
			let childAncestors = Object.assign({}, currentScriptAncestors);
			childAncestors[currentScript.scriptFilePath] = true;

			includeValue = await insertSortedIncludes(scriptInclude.script, readScript, path, childAncestors, processedScripts, allScripts, onDependencyLoaded);
			includeValue = shaderNewLine + includeValue + shaderNewLine;

			processedScripts[scriptInclude.script.scriptFilePath] = true
		}

		result = beforeInclude + includeValue + afterInclude;
		includeMatchOffset += (includeValue.length - scriptInclude.includeMatchLength);
	}

	return result;
}

interface IncludeInfo
{
	script: ScriptInfo;
	includeMatchOffset: number;
	includeMatchLength: number;
}

async function getScriptIncludes(
	script: ScriptInfo,
	readScript: readScript,
	path: path,
	allScripts: ScriptMap,
	onDependencyLoaded: (dependencyPath: string) => void): Promise<IncludeInfo[]>
{
	let includes: IncludeInfo[] = [];

	if (hasValue(script))
	{
		let regex = /^\#pragma include \"(.*)\"$/gm;

		let includeMatch = regex.exec(script.script);

		while (includeMatch)
		{
			let relativeIncludeFilePath = includeMatch[1];

			let includeFilePath = path.resolve(script.scriptFolderPath, relativeIncludeFilePath);
			let includeFolderPath = path.dirname(includeFilePath);
			let includeFileName = path.basename(includeFilePath);

			let includeScript = allScripts[includeFilePath];

			if (nullOrUndefined(includeScript))
			{
				includeScript =
					{
						script: await readShaderScript(includeFilePath, readScript),
						scriptFilePath: includeFilePath,
						scriptFolderPath: includeFolderPath,
						scriptFileName: includeFileName
					};

				onDependencyLoaded(includeFilePath);

				allScripts[includeFilePath] = includeScript;
			}

			let includeInfo: IncludeInfo =
				{
					script: includeScript,
					includeMatchOffset: includeMatch.index,
					includeMatchLength: includeMatch[0].length
				};

			includes.push(includeInfo);

			includeMatch = regex.exec(script.script);
		}
	}

	return includes;
}

async function readShaderScript(path: string, readScript: readScript): Promise<string>
{
	let script = await readScript(path);
	return fixLineEndings(script);
}

function fixLineEndings(source: string)
{
	return source.replace("\r\n", shaderNewLine);
}

function appendLine(currentValue: string, lineToAppend: string): string
{
	if (nullOrUndefined(lineToAppend))
	{
		return currentValue;
	}

	return currentValue + lineToAppend + shaderNewLine;
}

function hasValue(obj: any): boolean
{
	return (false == nullOrUndefined(obj));
}

function nullOrUndefined(obj: any): boolean
{
	return (obj === null) || (obj === undefined);
}
