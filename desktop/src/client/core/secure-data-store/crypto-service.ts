import { Injectable } from "@angular/core";
import * as crypto from "crypto";
import { KeytarService } from "./keytar.service";

/**
 * Keytar service and key to save the master key
 */
const BATCH_APPLICATION = "BatchExplorer";
const KEYTAR_KEY = "master-v2";

/**
 * Length of the initialization vector
 */
const IV_BYTES = 16;

/**
 * Current encryption algorithm: AES-256-GCM with 32-byte key
 */
const ALGORITHM = "aes-256-gcm";
const ALGORITHM_VERSION = 2;

/**
 * GCM tag length for authenticated encryption
 */
const GCM_TAG_LENGTH = 16;

/**
 * Version header length (1 byte)
 */
const VERSION_HEADER_LENGTH = 1;

/**
 * Key size in bytes (32 bytes = 256 bits)
 */
const KEY_BYTES = 32;

// What encoding to use when converting buffer to string
const DEFAULT_STRING_ENCODING = "base64";

export class UnsupportedEncryptionVersionError extends Error {
    constructor(version: number) {
        super(`Unsupported encryption version: ${version}. Please re-authenticate.`);
        this.name = "UnsupportedEncryptionVersionError";
    }
}

@Injectable({ providedIn: "root" })
export class CryptoService {
    private _masterKey: Promise<string> | null = null;

    constructor(private keytar: KeytarService) {
        // Don't load keys in constructor - defer until first use to avoid IPC initialization issues
    }

    private _ensureMasterKey(): Promise<string> {
        if (!this._masterKey) {
            this._masterKey = this._loadMasterKey();
        }
        return this._masterKey;
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
        const keyHex = await this._ensureMasterKey();
        const key = Buffer.from(keyHex, "hex") as crypto.CipherKey;
        const iv = this._getIV();

        const cipher = crypto.createCipheriv(ALGORITHM as any, key, iv as crypto.BinaryLike);
        const encrypted = cipher.update(content as crypto.BinaryLike);
        cipher.final();
        const tag = cipher.getAuthTag();

        // Format: [version(1)] + [iv(16)] + [tag(16)] + [encrypted_data]
        return Buffer.concat([
            new Uint8Array([ALGORITHM_VERSION]),
            iv,
            tag,
            encrypted
        ]);
    }

    private async _decryptBuffer(content: Buffer): Promise<Buffer> {
        // Verify minimum length and version header
        if (content.length < VERSION_HEADER_LENGTH + IV_BYTES + GCM_TAG_LENGTH) {
            throw new Error("Invalid encrypted data: content too short");
        }

        const version = content[0];
        if (version !== ALGORITHM_VERSION) {
            throw new UnsupportedEncryptionVersionError(version);
        }

        const keyHex = await this._ensureMasterKey();
        const key = Buffer.from(keyHex, "hex") as crypto.CipherKey;
        const iv = content.slice(VERSION_HEADER_LENGTH, VERSION_HEADER_LENGTH + IV_BYTES);
        const tag = content.slice(VERSION_HEADER_LENGTH + IV_BYTES, VERSION_HEADER_LENGTH + IV_BYTES + GCM_TAG_LENGTH);
        const encrypted = content.slice(VERSION_HEADER_LENGTH + IV_BYTES + GCM_TAG_LENGTH);

        const decipher = crypto.createDecipheriv(ALGORITHM as any, key, iv as crypto.BinaryLike);
        decipher.setAuthTag(tag);
        return Buffer.concat([decipher.update(encrypted), decipher.final()]);
    }

    private async _loadMasterKey(): Promise<string> {
        let masterKey = await this.keytar.getPassword(BATCH_APPLICATION, KEYTAR_KEY);
        if (!masterKey) {
            masterKey = crypto.randomBytes(KEY_BYTES).toString("hex");
            await this.keytar.setPassword(BATCH_APPLICATION, KEYTAR_KEY, masterKey);
        }
        return masterKey;
    }

    private _getIV(): Buffer {
        return crypto.randomBytes(IV_BYTES);
    }
}
