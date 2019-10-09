import { ComponentPortal, PortalHostDirective } from "@angular/cdk/portal";
import {
    Component,
    ComponentRef,
    Injector,
    Input,
    OnInit,
    Type,
    ViewChild,
} from "@angular/core";
import { MatSidenav } from "@angular/material";
import { log } from "@batch-flask/utils";
import { GlobalSidebarService } from "../sidebar-manager";
import { SidebarPageComponent } from "../sidebar-page";
import { SidebarRef } from "../sidebar-ref";

import "./sidebar-content.scss";

@Component({
    selector: "bl-sidebar-content",
    templateUrl: "sidebar-content.html",
})
export class SidebarContentComponent implements OnInit {
    @Input()  private sidebar: MatSidenav;

    @ViewChild(PortalHostDirective, { static: false }) private portalHost: PortalHostDirective;

    private currentComponentRef: ComponentRef<SidebarPageComponent>;

    private componentRefs: { [key: string]: ComponentRef<SidebarPageComponent> } = {};

    constructor(private reference: GlobalSidebarService) { }

    public ngOnInit() {
        this.reference.sidebar = this.sidebar;
        this.reference.sidebarContent = this;
    }

    /**
     * This will create a new component and display it.
     * i.e If the sidebar is not open it will open
     *     otherwise it will hide the current component and show this one instead.
     */
    public open<T>(componentType: Type<T>, sidebarRef: SidebarRef<T>, injector: Injector) {
        const id = sidebarRef.id;
        if (id in this.componentRefs) {
            this.componentRefs[id].destroy();
        }

        const componentPortal = new ComponentPortal(SidebarPageComponent, null, injector);
        const component = this.portalHost.attachComponentPortal(componentPortal);
        component.instance.attachComponent(componentType, sidebarRef);
        this.componentRefs[id] = component;
        this.switchDisplay(component);
    }

    /**
     * Switch the display to this content
     */
    public display<T>(sidebarRef: SidebarRef<T>) {
        const id = sidebarRef.id;
        if (id in this.componentRefs) {
            this.switchDisplay(this.componentRefs[id]);
        } else {
            log.error(`SidebarRef with id '${id}' doesn't exist.`);
        }
    }

    /**
     * This remove the component and close the sidebar
     */
    public destroy<T>(sidebarRef: SidebarRef<T>) {
        if (this.currentComponentRef) {
            this.currentComponentRef.destroy();
            this.currentComponentRef = null;
        }
        this.sidebar.close();
    }

    private switchDisplay(newComponentRef: ComponentRef<SidebarPageComponent>) {
        if (this.currentComponentRef) {
            this.currentComponentRef.instance.hide();
        }
        newComponentRef.instance.show();
        this.currentComponentRef = newComponentRef;
    }
}
