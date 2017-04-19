import {
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    Injector,
    NgZone,
    OnDestroy,
    Type,
    ViewChild,
    ViewEncapsulation,
} from "@angular/core";
import { ComponentPortal, PortalHostDirective } from "@angular/material";

import { log } from "app/utils";
import { SidebarInjector } from "./sidebar-injector";
import { SidebarManager } from "./sidebar-manager";
import { SidebarRef } from "./sidebar-ref";

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "bl-sidebar-page",
    template: `
        <div [hidden]="!display" style="height: 100%">
                <template portalHost></template>
        </div>
    `,
})
export class SidebarPageComponent implements OnDestroy {
    public display = true;

    @ViewChild(PortalHostDirective)
    private portalHost: PortalHostDirective;

    private componentRef: ComponentRef<any> = null;
    private onSideBarOpenEvent: any;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private injector: Injector,
        private ngZone: NgZone,
        private sidebarManager: SidebarManager) {
    }

    public attachComponent<T>(componentType: Type<T>, sidebarRef: SidebarRef<T>) {
        if (this.hasAttached()) {
            log.error("Error component already attached!");
        }

        const sidebarInjector = new SidebarInjector(sidebarRef, this.injector);
        const componentPortal = new ComponentPortal(componentType, null, sidebarInjector);
        this.componentRef = this.portalHost.attachComponentPortal(componentPortal);
        sidebarRef.page = this;
        sidebarRef.component = this.componentRef.instance;
    }

    public show() {
        this.display = true;
    }

    public hide() {
        this.display = false;
    }

    public hasAttached(): boolean {
        return this.componentRef !== null;
    }

    public ngOnDestroy() {
        if (this.onSideBarOpenEvent) {
            this.onSideBarOpenEvent.unsubscribe();
        }
    }
}
