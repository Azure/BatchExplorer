import { Injectable } from "@angular/core";
import { LocalStorage } from "./local-storage";

@Injectable()
export class BrowserLocalStorage extends LocalStorage {
    public async save(key: string, content: string): Promise<void> {
        localStorage.setItem(key, content);
    }

    public async read(key: string): Promise<string | null> {
        return Promise.resolve(localStorage.getItem(key));
    }
}
