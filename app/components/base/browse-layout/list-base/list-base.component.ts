import { Component, InjectionToken, Type, forwardRef } from "@angular/core";
import { Observable } from "rxjs";

export abstract class ListBaseComponent {
    public abstract refresh(): Observable<any>;
}

// export const INTERFACE_TOKEN = new InjectionToken<ListBaseComponent>("ListBaseComponent");

export function listBaseProvider(callback: () => Type<any>) {
    return {
        provide: ListBaseComponent,
        useExisting: forwardRef(callback),
    };
}
