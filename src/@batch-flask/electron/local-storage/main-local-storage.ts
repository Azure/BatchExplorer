import { Injectable } from "@angular/core";
import { LocalStorage } from "@batch-flask/core";
import * as path from "path";
import { FileSystemService } from "../fs.service";

@Injectable()
export class MainLocalStorage extends LocalStorage {

    constructor(private fs: FileSystemService) {
        super();
    }

    public async save(key: string, content: string): Promise<void> {
        await this.fs.saveFile(this._getFile(key), content);
    }

    public async read(key: string): Promise<string | null> {
        return this.fs.readFile(this._getFile(key)).catch(() => null);
    }

    private _getFile(key: string) {
        return path.join(this.fs.commonFolders.userData, `${key}.json`);
    }
}
