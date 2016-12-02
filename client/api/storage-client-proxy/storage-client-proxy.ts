
import AccountStorage from "./accountStorage";

export default class StorageClientProxy {
    public accounts: AccountStorage;

    constructor() {
        this.accounts = new AccountStorage();
    }
}
