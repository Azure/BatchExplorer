import { Injectable } from "@angular/core";
import { safeStorage } from "electron";
import { GlobalStorage } from "@batch-flask/core";

/**
 * Handles safeStorage operations using Electron's safeStorage API.
 */
@Injectable({ providedIn: "root" })
export class SafeStorageMainService {
    private _storageKey = "safeStorageData";

    constructor(private _storage: GlobalStorage) {
    }

    public async setPassword(key: string, password: string): Promise<void> {
        if (!safeStorage.isEncryptionAvailable()) {
            throw new Error("Encryption is not available on this platform. Cannot store credentials securely.");
        }

        // Get existing data or create new storage object
        const storageData = await this._getStorageData();

        // Encrypt the password
        const encrypted = safeStorage.encryptString(password);

        // Store the encrypted data with base64 encoding for JSON serialization
        storageData[key] = encrypted.toString("base64");

        // Save back to storage
        await this._saveStorageData(storageData);
    }

    public async getPassword(key: string): Promise<string | null> {
        if (!safeStorage.isEncryptionAvailable()) {
            return null;
        }

        const storageData = await this._getStorageData();
        const encryptedBase64 = storageData[key];

        if (!encryptedBase64) {
            return null;
        }

        try {
            const encryptedBuffer = Buffer.from(encryptedBase64, "base64");
            return safeStorage.decryptString(encryptedBuffer);
        } catch (error) {
            console.warn(`Failed to decrypt password for key ${key}:`, error);
            return null;
        }
    }

    public async deletePassword(key: string): Promise<boolean> {
        const storageData = await this._getStorageData();

        if (storageData[key]) {
            delete storageData[key];
            await this._saveStorageData(storageData);
            return true;
        }

        return false;
    }

    private async _getStorageData(): Promise<{ [key: string]: string }> {
        try {
            const data = await this._storage.get(this._storageKey);
            return data || {};
        } catch (error) {
            return {};
        }
    }

    private async _saveStorageData(data: { [key: string]: string }): Promise<void> {
        await this._storage.set(this._storageKey, data);
    }
}