import { Injectable } from "@angular/core";
import { FileSystemService } from "@batch-flask/ui";
import { DateUtils } from "@batch-flask/utils";
import * as path from "path";

/**
 * Service used to cache large set of data to be reused
 */
@Injectable({providedIn: "root"})
export class CacheDataService {

    constructor(private fs: FileSystemService) { }

    public async cache(key: string, data: any): Promise<string> {
        const filename = this._cacheFilename(key);
        return this.fs.saveFile(filename, JSON.stringify({ lastSync: new Date(), data }));
    }

    /**
     *
     * @param key
     * @param maxDays Maximum number of hours to retrieve the cache
     */
    public async read(key: string, maxHours: number = 24): Promise<any> {
        const filename = this._cacheFilename(key);
        try {
            const content = await this.fs.readFile(filename);
            const json = JSON.parse(content);
            const lastSync = new Date(json.lastSync);
            if (!DateUtils.withinRange(lastSync, maxHours, "hour")) {
                return null;
            }
            return json.data;
        } catch (e) {
            return null;
        }
    }

    public get cacheFolder() {
        return path.join(this.fs.commonFolders.temp, "data-cache");
    }

    /**
     * Return the full path of the file used to cache the given key
     * @param key Unique key for this cache data
     */
    private _cacheFilename(key: string): string {
        return path.join(this.cacheFolder, `${key}.json`);
    }
}
