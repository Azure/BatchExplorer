import { log } from "@batch-flask/utils";

/**
 * Low level storage abstraction.
 * To be implemented differently in browser and in electron
 *  - Electron: Use local file
 *  - Browser will user localStorage property
 */
export abstract class LocalStorage {

    public set<T extends {}>(key: string, value: T) {
        const content = JSON.stringify(value);
        return this.save(key, content);
    }

    public async get<T extends {}>(key: string): Promise<T | null> {
        const content = await this.read(key);
        if (!content) { return null; }

        try {
            return JSON.parse(content);
        } catch (e) {
            log.error("Loading file from storage has invalid json", { key, content });
            return null;
        }
    }

    public abstract save(key: string, content: string): Promise<void>;
    public abstract read(key: string): Promise<string>;
}
