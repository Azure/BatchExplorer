import { Injectable } from "@angular/core";
import * as crypto from "crypto";
import * as keytar from "keytar";

/**
 * Keytar service and key to save the master key
 */
const BATCH_APPLICATION = "batch-explorer";
const KEYTAR_KEY = "key";

/**
 * Length of the initialization vector
 */
const IV_BYTES = 16;

/**
 * Algorithm to use when encrypting
 */
const ENCRYPT_ALGORITHM = "aes-256-ctr";

// What encoding to use when converting buffer to string
const DEFAULT_STRING_ENCODING = "base64";

@Injectable({ providedIn: "root" })
export class CryptoService {
    private _masterKey: Promise<string>;

    constructor() {
        this._masterKey = this._loadMasterKey();
    }

    public async encrypt(content: Buffer): Promise<Buffer>;
    public async encrypt(content: string): Promise<string>;
    public async encrypt(content: Buffer | string): Promise<Buffer | string> {
        if (typeof content === "string") {
            const buffer = await this._encryptBuffer(Buffer.from(content));
            return buffer.toString(DEFAULT_STRING_ENCODING);
        } else {
            return this._encryptBuffer(content);
        }
    }

    public async decrypt(content: Buffer): Promise<Buffer>;
    public async decrypt(content: string): Promise<string>;
    public async decrypt(content: Buffer | string): Promise<Buffer | string> {
        if (typeof content === "string") {
            const buffer = await this._decryptBuffer(Buffer.from(content, DEFAULT_STRING_ENCODING));
            return buffer.toString("utf8");
        } else {
            return this._decryptBuffer(content);
        }
    }

    private async _encryptBuffer(content: Buffer): Promise<Buffer> {
        const key = await this._masterKey;
        const iv = this._getIV();
        const cipher = crypto.createCipheriv(ENCRYPT_ALGORITHM, key, iv);
        return Buffer.concat([iv, cipher.update(content), cipher.final()]);
    }

    private async _decryptBuffer(content: Buffer): Promise<Buffer> {
        const key = await this._masterKey;
        const iv = content.slice(0, IV_BYTES);
        const decipher = crypto.createDecipheriv(ENCRYPT_ALGORITHM, key, iv);
        return Buffer.concat([decipher.update(content.slice(16)), decipher.final()]);
    }

    private async _loadMasterKey(): Promise<string> {
        let masterKey = await keytar.getPassword(BATCH_APPLICATION, KEYTAR_KEY);
        if (!masterKey) {
            masterKey = this._generateMasterKey();
            await keytar.setPassword(BATCH_APPLICATION, KEYTAR_KEY, masterKey);
        }
        return masterKey;
    }

    private _generateMasterKey() {
        return crypto.randomBytes(16).toString("hex");
    }

    private _getIV() {
        return crypto.randomBytes(IV_BYTES);
    }
}
