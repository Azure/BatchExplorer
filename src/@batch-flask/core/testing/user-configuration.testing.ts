import { BehaviorSubject } from "rxjs";
import { UserConfigurationService, UserConfigurationStore } from "../user-configuration";

export class MockUserConfigurationService<T = any> extends UserConfigurationService<T> {
    constructor(config: Partial<T>) {
        const store: UserConfigurationStore<T> = {
            config: new BehaviorSubject<T>(config as any),
            save: () => Promise.resolve(),
        };
        super(store, {} as any);
    }
}
