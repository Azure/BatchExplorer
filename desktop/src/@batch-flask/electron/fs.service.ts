import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import { FSWatcher } from "chokidar";
import * as fs from "fs";
import * as path from "path";
import { ElectronApp } from "./electron-app.service";

export interface CommonFolders {
    temp: string;
    downloads: string;
    appData: string;
    userData: string;
    home: string;
}

/**
 * Service to handle saving files to the client FileSystem
 */
@Injectable()
export class FileSystemService {
    public commonFolders: CommonFolders;
    private _fs: typeof import("fs");
    private _makeDir: typeof import("make-dir").default;
    private _glob: typeof import("glob");
    private _chokidar: typeof import("chokidar");
    private _download: typeof import("download");
    private _extractZip: typeof import("extract-zip");

    constructor(app: ElectronApp) {
        this._fs = app.require("fs");
        this._makeDir = app.require("make-dir");
        this._glob = app.require("glob");
        this._chokidar = app.require("chokidar");
        this._download = app.require("download");
        this._extractZip = app.require("extract-zip");

        this.commonFolders = {
            temp: path.join(app.getPath("temp"), "batch-explorer"),
            downloads: app.getPath("downloads"),
            appData: app.getPath("appData"),
            userData: app.getPath("userData"),
            home: app.getPath("home"),
        };
    }

    /**
     * Check if a file exists async
     * @param path Full path to the file
     */
    public async exists(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._fs.exists(path, (exists) => {
                resolve(exists);
            });
        });
    }

    /**
     * This make sure the given dir exists. Will recusrivelly create any missing directory.
     * @param directory: Path that we expect to exists
     */
    public ensureDir(directory: string): Promise<string> {
        return this._makeDir(directory);
    }

    /**
     * Save the given content to the given location.
     *
     * @param filename: Full path to the file
     * @param content: Content of the file
     */
    public saveFile(dest: string, content: string): Promise<string> {
        return this.ensureDir(path.dirname(dest)).then(() => {
            return this._writeFile(dest, content);
        });
    }

    public readFile(path: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data.toString());
            });
        });
    }

    public async readdir(dir: string, recursive = true): Promise<string[]> {
        const content = await this._readDir(dir);
        if (!recursive) { return content; }
        let result: string[] = [];
        for (const entry of content) {
            const stats = await this.lstat(path.join(dir, entry));
            if (stats.isFile()) {
                result.push(entry);
            } else {
                const subFiles = await this.readdir(path.join(dir, entry), true);
                result = result.concat(subFiles.map((x) => {
                    return path.join(path.join(entry, x));
                }));
            }
        }
        return result;
    }

    public async download(source: string, dest: string): Promise<string> {
        await this.ensureDir(path.dirname(dest));
        await this._download(source, path.dirname(dest), {
            filename: path.basename(dest),
        });
        return dest;
    }

    /**
     * Unzip the given zip file content to the given folder as you would expect from a os unzip
     * @param source Path to the zip file
     * @param dest Folder where the zip file should be extracted
     */
    public unzip(source: string, dest: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this._extractZip(source, { dir: dest }, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    public async lstat(path: string): Promise<fs.Stats> {
        return new Promise<fs.Stats>((resolve, reject) => {
            fs.lstat(path, (error, stats) => {
                if (error) {
                    return reject(error);
                }
                resolve(stats);
            });
        });
    }

    public async stat(path: string): Promise<fs.Stats> {
        return new Promise<fs.Stats>((resolve, reject) => {
            fs.stat(path, (error, stats) => {
                if (error) {
                    return reject(error);
                }
                resolve(stats);
            });
        });
    }

    public watch(path: string): FSWatcher {
        return this._chokidar.watch(path);
    }

    public glob(pattern: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this._glob(pattern, (err, files) => {
                if (err) { reject(err); return; }
                resolve(files);
            });
        });
    }

    private _writeFile(path: string, content: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.writeFile(path, content, (err) => {
                if (err) {
                    log.error(`An error occured writing file "${path}" to disk`, err);
                    reject(err);
                }
                resolve(path);
            });
        });
    }

    private async _readDir(path: string) {
        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(path, (error, files) => {
                if (error) {
                    return reject(error);
                }
                resolve(files);
            });
        });
    }
}
