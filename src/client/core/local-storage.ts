import { logger } from "client/logger";
import * as path from "path";
import { FileSystem } from "./fs";

const fs = new FileSystem();
export class LocalStorage {
    public async get<T>(key: string): Promise<T> {
        const content = await this.read(key);
        if (!content) {
            return {} as any;
        }

        try {
            return JSON.parse(content);
        } catch (e) {
            logger.error("Loading file from storage has invalid json", { key, content });
            return {} as any;
        }
    }

    public async set<T>(key: string, data: T) {
        const content = JSON.stringify(data);
        return this.write(key, content);
    }

    public async read(key: string): Promise<string> {
        return fs.readFile(this._getFile(key)).catch(() => null);
    }

    public async write(key: string, content: string): Promise<string> {
        return fs.saveFile(this._getFile(key), content);
    }

    private _getFile(key: string) {
        const filename = key.endsWith(".json") ? key : `${key}.json`;
        return path.join(fs.commonFolders.userData, filename);
    }
}
