import { Injectable } from "@angular/core";
import { FileSystemService } from "@batch-flask/electron";
import { log } from "@batch-flask/utils";
import * as path from "path";

@Injectable({ providedIn: "root" })
export class LocalFileStorage {
    constructor(private fs: FileSystemService) {

    }
    public async get<T>(key: string): Promise<T> {
        const content = await this.read(key);
        if (!content) {
            return {} as any;
        }

        try {
            return JSON.parse(content);
        } catch (e) {
            log.error("Loading file from storage has invalid json", { key, content });
            return {} as any;
        }
    }

    public async set<T>(key: string, data: T) {
        const content = JSON.stringify(data);
        return this.write(key, content);
    }

    public async read(key: string): Promise<string | null> {
        return this.fs.readFile(this._getFile(key)).catch(() => null);
    }

    public async write(key: string, content: string): Promise<string> {
        return this.fs.saveFile(this._getFile(key), content);
    }

    private _getFile(key: string) {
        const filename = key.endsWith(".json") ? key : `${key}.json`;
        return path.join(this.fs.commonFolders.userData, filename);
    }
}
