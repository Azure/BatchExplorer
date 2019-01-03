import { Injectable } from "@angular/core";

/**
 * Service wrapping keytar to make it easier to mock
 */
@Injectable({ providedIn: "root" })
export class KeytarService {
    private keytar: any;
    constructor() {
        this.keytar = require("keytar");
    }
    public async setPassword(service: string, account: string, password: string) {
        return this.keytar.setPassword(service, account, password);
    }

    public async getPassword(service: string, account: string): Promise<string | null> {
        return this.keytar.getPassword(service, account);
    }
}
