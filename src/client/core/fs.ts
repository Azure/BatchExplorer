import { FileUtils } from "client/api";
import { logger } from "client/logger";
import { app } from "electron";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";

export interface CommonFolders {
    temp: string;
    downloads: string;
    appData: string;
    userData: string;
}

const fileUtils = new FileUtils();
export class FileSystem {
    public commonFolders = {
        temp: path.join(app.getPath("temp"), "batch-labs"),
        downloads: app.getPath("downloads"),
        appData: app.getPath("appData"),
        userData: app.getPath("userData"),
    };

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
            return fileUtils.download(source, dest);
        });
    }

    /**
     * Unzip the given zip file content to the given folder as you would expect from a os unzip
     * @param source Path to the zip file
     * @param dest Folder where the zip file should be extracted
     */
    public unzip(source: string, dest: string): Promise<void> {
        return fileUtils.unzip(source, dest);
    }

    private _writeFile(path: string, content: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.writeFile(path, content, (err) => {
                if (err) {
                    logger.error(`An error occured writing file "${path}" to disk`, err);
                    reject(err);
                }
                resolve(path);
            });
        });
    }
}
