import { Injector } from "@angular/core";

import { SidebarRef } from "./sidebar-ref";

/** Custom injector type specifically for instantiating components with a dialog. */
export class SidebarInjector implements Injector {
    constructor(private dialogRef: SidebarRef<any>, private parentInjector: Injector) { }

    public get(token: any, notFoundValue?: any): any {
        if (token === SidebarRef) {
            return this.dialogRef;
        }

        return this.parentInjector.get(token, notFoundValue);
    }
}
