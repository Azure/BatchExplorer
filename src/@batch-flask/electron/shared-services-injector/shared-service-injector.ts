import { Injectable, Injector } from "@angular/core";
import { ElectronRemote } from "../remote.service";

export class UnkownSharedServiceError extends Error {
    constructor(name: string) {
        super(`Shared service ${name} is not registered. Make sure to add {provide: MY_TOKEN, useExisting: MySharedService}`)
    }
}

@Injectable()
export class SharedServiceInjector {
    private _injector: Injector;

    constructor(remote: ElectronRemote) {
        this._injector = remote.getCurrentWindow()._injector;
    }

    public get<T = any>(name: string) {
        const service = this._injector.get(name);
        if (!service) {
            throw new UnkownSharedServiceError(name);
        }

        return service
    }
}
