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
import {
    ComponentPortal,
    FocusTrap,
    PortalHostDirective,
} from "@angular/material";

import { SidebarInjector } from "./sidebar-injector";
import { SidebarManager } from "./sidebar-manager";
import { SidebarRef } from "./sidebar-ref";

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "bex-sidebar-page",
    template: `
        <div [hidden]="!display">
            <focus-trap>
                <template portalHost></template>
            </focus-trap>
        </div>
    `,
})
export class SidebarPageComponent implements OnDestroy {
    public display = true;

    @ViewChild(PortalHostDirective)
    private portalHost: PortalHostDirective;

    @ViewChild(FocusTrap)
    private focusTrap: FocusTrap;

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
            console.error("Error component already attached!");
        }

        const sidebarInjector = new SidebarInjector(sidebarRef, this.injector);
        const componentPortal = new ComponentPortal(componentType, null, sidebarInjector);
        this.componentRef = this.portalHost.attachComponentPortal(componentPortal);
        sidebarRef.page = this;
        sidebarRef.component = this.componentRef.instance;

        this.onSideBarOpenEvent = this.sidebarManager.onOpen.subscribe(() => {
            this.resetFocus();
        });
    }

    public show() {
        this.display = true;
    }

    public resetFocus() {
        this.focusTrap.focusFirstTabbableElement();
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
