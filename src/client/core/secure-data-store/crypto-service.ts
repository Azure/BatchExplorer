import { Injectable } from "@angular/core";
import * as crypto from "crypto";
import * as keytar from "keytar";

const BATCH_APPLICATION = "batch-explorer";
const KEYTAR_KEY = "key";

const ENCRYPT_ALGORITHM = "aes-256-ctr";

@Injectable({ providedIn: "root" })
export class CryptoService {
    private _masterKey: Promise<string>;

    constructor() {
        this._masterKey = this._loadMasterKey();
    }

    public async encrypt(content: string): Promise<string> {
        const key = await this._masterKey;
        const cipher = crypto.createCipheriv(ENCRYPT_ALGORITHM, key, this._getIV());
        let crypted = cipher.update(content, "utf8", "hex");
        crypted += cipher.final("hex");
        return crypted;
    }

    public async decrypt(encryptedContent: string): Promise<string> {
        const key = await this._masterKey;
        const decipher = crypto.createDecipheriv(ENCRYPT_ALGORITHM, key, this._getIV());
        let dec = decipher.update(encryptedContent, "hex", "utf8");
        dec += decipher.final("utf8");
        return dec;
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
        return crypto.pseudoRandomBytes(16);
    }
}
