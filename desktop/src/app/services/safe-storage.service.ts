import { Injectable } from "@angular/core";
import { IpcService } from "@batch-flask/electron";
import { IpcEvent } from "common/constants";

/**
 * Service wrapping Electron's safeStorage API for secure credential storage.
 * This service is for use in the renderer process and communicates with the main process via IPC.
 */
@Injectable({ providedIn: "root" })
export class SafeStorageService {
    constructor(private ipc: IpcService) {}

    /**
     * Store a password securely using Electron's safeStorage API
     * @param service Service name (equivalent to keytar service)
     * @param account Account name (equivalent to keytar account)
     * @param password Password to store
     */
    public async setPassword(service: string, account: string, password: string): Promise<void> {
        const key = `${service}:${account}`;
        return this.ipc.send(IpcEvent.safeStorage.setPassword, { key, password });
    }

    /**
     * Retrieve a password securely using Electron's safeStorage API
     * @param service Service name (equivalent to keytar service)
     * @param account Account name (equivalent to keytar account)
     * @returns Promise resolving to password or null if not found
     */
    public async getPassword(service: string, account: string): Promise<string | null> {
        const key = `${service}:${account}`;
        return this.ipc.send(IpcEvent.safeStorage.getPassword, { key });
    }

    /**
     * Delete a password from secure storage
     * @param service Service name
     * @param account Account name
     */
    public async deletePassword(service: string, account: string): Promise<boolean> {
        const key = `${service}:${account}`;
        return this.ipc.send(IpcEvent.safeStorage.deletePassword, { key });
    }

    /**
     * Check if encryption is available
     * Important on Linux where safeStorage may fall back to unencrypted storage
     */
    public async isEncryptionAvailable(): Promise<boolean> {
        return this.ipc.send(IpcEvent.safeStorage.isEncryptionAvailable);
    }
}
