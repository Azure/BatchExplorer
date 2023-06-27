import { Injectable } from "@angular/core";
import { OS, Platform } from "@batch-flask/utils";

@Injectable()
export class OSService {
    public platform: Platform;

    constructor() {
        this.platform = OS.platform;
    }
    public isWindows(): boolean {
        return OS.isWindows();
    }

    public isOSX(): boolean {
        return OS.isOSX();
    }

    public isLinux(): boolean {
        return OS.isLinux();
    }
}
