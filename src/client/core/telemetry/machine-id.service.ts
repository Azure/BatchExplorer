import { Injectable } from "@angular/core";
import { DataStore } from "@batch-flask/core";
import { SecureUtils } from "@batch-flask/utils";
import { Constants } from "common";

@Injectable()
export class MachineIdService {
    private _id: string;

    constructor(private dataStore: DataStore) {

    }

    public async get() {
        if (this._id) {
            return this._id;
        }
        const storedKey = await this.dataStore.getItem(Constants.localStorageKey.machineId);
        if (storedKey) {
            this._id = storedKey;
        } else {
            this._id = SecureUtils.uuid();
            await this.dataStore.setItem(Constants.localStorageKey.machineId, this._id);
        }

        return this._id;
    }
}
