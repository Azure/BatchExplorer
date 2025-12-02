import { Injectable } from "@angular/core";
import { SafeStorageMainService } from "./safe-storage-main.service";

/**
 * Service wrapping credential storage. Uses Electron's safeStorage API.
 * This is for use in the main process.
 */
@Injectable({ providedIn: "root" })
export class KeytarService {
    constructor(private safeStorage: SafeStorageMainService) {}

    public async setPassword(service: string, account: string, password: string) {
        try {
            const key = `${service}:${account}`;
            return await this.safeStorage.setPassword(key, password);
        } catch (error) {
            // If encryption is not available, log the error but allow the app
            // to try memory-only auth token storage
            console.warn(`Failed to store credentials securely for ${service}:${account}:`,
                error.message);
        }
    }

    public async getPassword(service: string, account: string): Promise<string | null> {
        const key = `${service}:${account}`;
        return this.safeStorage.getPassword(key);
    }
}
