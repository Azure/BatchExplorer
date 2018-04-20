import { Injectable, Injector, ReflectiveInjector, Type } from "@angular/core";

import { EntityCommands } from "@batch-flask/ui/entity-commands";

/**
 * Helper class to create a new instance of an object using dependency injection
 */
@Injectable()
export class InjectorFactory {
    constructor(private injector: Injector) { }

    public create<T extends EntityCommands<any>>(type: Type<T>): T {
        return ReflectiveInjector.resolveAndCreate([type], this.injector).resolveAndInstantiate(type);
    }
}
