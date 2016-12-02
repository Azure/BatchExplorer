import { app } from "electron";
import * as path from "path";

/**
 * Change the location where the application data is stored.
 * We should really think about another storage medium as this one is
 * proving to be rather inadequate.
 *
 * We need to call setPath before we import the json-storage module otherwise it
 * is too late.
 */
app.setPath("userData", path.join(app.getPath("appData"), "batch-explorer"));

import * as storage from "electron-json-storage";

export interface Account {
    alias: string;
    name: string;
    url: string;
    key: string;
    isDefault: boolean;
}

export default class AccountStorage {
    private accountJsonFileName: string = "accounts";

    /**
     * Check if we are storing data with the given key.
     */
    public hasKey(key: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            storage.has(key, function (error, hasKey) {
                if (error) { return reject(error); }
                return resolve(hasKey);
            });
        });
    }

    /**
     * List all stored account credentials
     */
    public list(): Promise<Account[]> {
        return new Promise((resolve, reject) => {
            storage.get(this.accountJsonFileName, function (error, data) {
                if (error) { return reject(error); }
                if (Array.isArray(data)) {
                    return resolve(data);
                } else {
                    return resolve([]);
                }
            });
        });
    }

    /**
     * Get the account credential with the supplied name
     */
    public get(accountName: string): Promise<Account> {
        return new Promise((resolve, reject) => {
            this.list().then((accounts: Account[]) => {
                const found = accounts.filter((item: Account) => item.name === accountName);
                if (!found) {
                    return reject("Unable to find account: " + accountName);
                }

                if (found.length > 1) {
                    return reject("Multiple accounts exist with name: " + accountName);
                }

                return resolve(found[0]);
            }).catch((error) => {
                return reject(error);
            });
        });
    }

    /**
     * Store an account credential, will either insert or update a given account.
     */
    public store(account: Account, overwrite?: boolean): Promise<{}> {
        let tempArray = [];
        return new Promise((resolve, reject) => {
            this.list().then((accounts: Account[]) => {
                if (Array.isArray(accounts)) {
                    tempArray = tempArray.concat(accounts);
                }

                // see if there is an existing matching account
                let existingIndex = tempArray.findIndex((item: Account) => item.name === account.name);
                if (tempArray.length === 0 || existingIndex === -1) {
                    // adding the first account or no existing account found
                    tempArray.push(account);
                } else {
                    if (!overwrite && existingIndex > -1) {
                        return reject("Account already exists with name: " + account.name);
                    }

                    // either adding one to the end or overwriting one
                    existingIndex = existingIndex > -1 ? existingIndex : tempArray.length;
                    tempArray[existingIndex] = account;
                }

                // double check there are no null entries
                storage.set(this.accountJsonFileName, <any>tempArray.filter(item => item !== null), function (error) {
                    if (error) { return reject(error); }
                    return resolve();
                });
            }).catch((error) => {
                return reject(error);
            });
        });
    }

    /**
     * Delete an account credential from persisted storage.
     */
    public delete(accountName: string): Promise<{}> {
        return new Promise((resolve, reject) => {
            this.list().then((accounts: Account[]) => {
                const existingIndex = accounts.findIndex((item: Account) => item.name === accountName);
                if (existingIndex === -1) {
                    return reject("Account: " + accountName + ", does not exist: ");
                }

                accounts.splice(existingIndex, 1);
                storage.set(this.accountJsonFileName, <any>accounts, function (error) {
                    if (error) { return reject(error); }
                    return resolve();
                });
            }).catch((error) => {
                return reject(error);
            });
        });
    }
}
