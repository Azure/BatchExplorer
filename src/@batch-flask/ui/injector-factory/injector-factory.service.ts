import { Injectable, Injector, ReflectiveInjector, Type } from "@angular/core";

/**
 * Helper class to create a new instance of an object using dependency injection
 */
@Injectable()
export class InjectorFactory {
    constructor(private injector: Injector) { }

    public create<T>(type: Type<T>): T {
        return ReflectiveInjector.resolveAndCreate([type], this.injector).resolveAndInstantiate(type);
    }
}
