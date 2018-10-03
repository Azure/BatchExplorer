import { Injectable } from "@angular/core";
import { FSWatcher } from "chokidar";
import { ElectronRemote } from "../../electron/remote.service";

/**
 * Service to handle saving files to the client FileSystem
 */
@Injectable()
export class FileSystemService {
    public commonFolders: any;
    private _fs: any;

    constructor(remote: ElectronRemote) {
        this._fs = (remote.getCurrentWindow() as any).fs;
        this.commonFolders = { ...this._fs.commonFolders };
    }

    /**
     * Check if a file exists async
     * @param path Full path to the file
     */
    public async exists(path: string): Promise<boolean> {
        return this._fs.exists(path);
    }

    /**
     * This make sure the given dir exists. Will recusrivelly create any missing directory.
     * @param directory: Path that we expect to exists
     */
    public ensureDir(directory: string): Promise<void> {
        return this._fs.ensureDir(directory);
    }

    /**
     * Save the given content to the given location.
     *
     * @param filename: Full path to the file
     * @param content: Content of the file
     */
    public saveFile(dest: string, content: string): Promise<string> {
        return this._fs.saveFile(dest, content);
    }

    public readFile(path: string): Promise<string> {
        return this._fs.readFile(path);
    }

    public async readdir(path: string, recursive = true): Promise<string[]> {
        return this._fs.readdir(path, recursive);
    }

    public download(source: string, dest: string): Promise<string> {
        return this._fs.download(source, dest);
    }

    /**
     * Unzip the given zip file content to the given folder as you would expect from a os unzip
     * @param source Path to the zip file
     * @param dest Folder where the zip file should be extracted
     */
    public unzip(source: string, dest: string): Promise<void> {
        return this._fs.unzip(source, dest);
    }

    public async lstat(path: string) {
        return this._fs.lstat(path);
    }

    public watch(path: string): FSWatcher {
        return this._fs.watch(path);
    }
}
