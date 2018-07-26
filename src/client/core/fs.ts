import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import * as chokidar from "chokidar";
import { FileUtils } from "client/api";
import { app } from "electron";
import * as fs from "fs";
import * as glob from "glob";
import * as mkdirp from "mkdirp";
import * as path from "path";

export interface CommonFolders {
    temp: string;
    downloads: string;
    appData: string;
    userData: string;
    home: string;
}

@Injectable()
export class FileSystem {
    public commonFolders: CommonFolders;
    private _fileUtils: FileUtils;

    constructor() {
        this._fileUtils = new FileUtils();
        if (process.env.NODE_ENV !== "test") { // App is not defined in the test
            this.commonFolders = {
                temp: path.join(app.getPath("temp"), "batch-labs"),
                downloads: app.getPath("downloads"),
                appData: app.getPath("appData"),
                userData: app.getPath("userData"),
                home: app.getPath("home"),
            };
        }
    }

    /**
     * Check if a file exists async
     * @param path Full path to the file
     */
    public exists(path: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.exists(path, (exists) => {
                resolve(exists);
            });
        });
    }

    /**
     * This make sure the given dir exists. Will recusrivelly create any missing directory.
     * @param directory: Path that we expect to exists
     */
    public ensureDir(directory: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            mkdirp(directory, (err) => {
                if (err) { reject(err); }
                resolve();
            });
        });
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

    public download(source: string, dest: string): Promise<string> {
        return this.ensureDir(path.dirname(dest)).then(() => {
            return this._fileUtils.download(source, dest);
        });
    }

    /**
     * Unzip the given zip file content to the given folder as you would expect from a os unzip
     * @param source Path to the zip file
     * @param dest Folder where the zip file should be extracted
     */
    public unzip(source: string, dest: string): Promise<void> {
        return this._fileUtils.unzip(source, dest);
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

    public async readdir(dir: string, recursive = true): Promise<string[]> {
        const content = await this._readDir(dir);
        if (!recursive) { return content; }
        let result = [];
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

    public async glob(pattern: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            glob(pattern, (err, files) => {
                if (err) { reject(err); return; }
                resolve(files);
            });
        });
    }

    public watch(path: string): chokidar.FSWatcher {
        return chokidar.watch(path);
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
