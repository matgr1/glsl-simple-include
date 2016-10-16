export declare type readScript = (path: string) => Promise<string>;
export interface path {
    resolve(...path: string[]): string;
    dirname(path: string): string;
    basename(path: string, ext?: string): string;
}
export declare function processIncludes(readScript: readScript, path: path, entryScriptPath: string, entryScript?: string, preprocessorDefines?: string[]): Promise<string>;
