import { Injectable } from "@angular/core";
import { remote } from "electron";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";

const {app} = remote;
import { log } from "app/utils";

export interface CommonFolders {
    temp: string;
    downloads: string;
}

/**
 * Service to handle saving files to the client filesystem.
 */
@Injectable()
export class FileSystemService {
    public commonFolders: CommonFolders;

    constructor() {
        this.commonFolders = {
            temp: path.join(app.getPath("temp"), "batch-labs"),
            downloads: app.getPath("downloads"),
        };
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
     * @param filename: Name of the file(without directory)
     * @param content: Content of the file
     * @param directory: Where should the file be saved
     */
    public saveFile(filename: string, content: string, directory: string): Promise<string> {
        return this.ensureDir(directory).then(() => {
            return this._writeFile(path.join(directory, filename), content);
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
}
