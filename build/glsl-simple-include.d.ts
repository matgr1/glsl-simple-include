export interface ScriptInfo {
    script: string;
    scriptFilePath: string;
    scriptFolderPath: string;
    scriptFileName: string;
}
export declare type readScript = (path: string) => string;
export interface path {
    resolve(...path: string[]): string;
    dirname(path: string): string;
    basename(path: string, ext?: string): string;
}
export declare function processFile(entryPath: string, readScript: readScript, path: path, preprocessorDefines?: string[]): string;
export declare function processScript(entryScript: ScriptInfo, readScript: readScript, path: path, preprocessorDefines?: string[]): string;
