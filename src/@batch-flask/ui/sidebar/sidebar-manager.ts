import {
    Injectable,
    Type,
} from "@angular/core";
import { MatSidenav } from "@angular/material";
import { BehaviorSubject, Observable } from "rxjs";

import { log } from "@batch-flask/utils";
import { SidebarContentComponent } from "./sidebar-content";
import { SidebarRef } from "./sidebar-ref";

@Injectable()
export class SidebarManager {
    public sidebar: MatSidenav = null;
    public sidebarContent: SidebarContentComponent = null;
    public references: Observable<Array<SidebarRef<any>>>;

    private referenceMap: { [key: string]: SidebarRef<any> } = {};
    private referencesSubject: BehaviorSubject<Array<SidebarRef<any>>> = new BehaviorSubject([]);

    constructor() {
        this.references = this.referencesSubject.asObservable();
    }

    /**
     * @param id: Unique id for that form. This will allow it to persist
     * @param componentType: Component class you want to init inside the sidebar
     * @param resetOnOpen: By default when the sidebar is closed indirecly the component will still
     * be there so you can resume work. This will make sure it create a new component
     */
    public open<T>(id: string, componentType: Type<T>, resetOnReOpen = false): SidebarRef<T> {
        let sidebarRef: SidebarRef<T>;
        let openNew = true;
        if (id in this.referenceMap) {
            sidebarRef = this.referenceMap[id];
            openNew = resetOnReOpen;
        } else {
            sidebarRef = new SidebarRef<T>(this, id);
            this.referenceMap[id] = sidebarRef;
        }

        // If the component was already init before and we don't want to create a new one
        if (openNew) {
            this.sidebarContent.open(componentType, sidebarRef);
        } else {
            this.sidebarContent.display(sidebarRef);
        }

        this.sidebar.open();
        this.updateReferenceSubject();

        return sidebarRef;
    }

    public reopen<T>(sidebarRef: SidebarRef<T>) {
        const id = sidebarRef.id;
        if (id in this.referenceMap) {
            this.sidebarContent.display(this.referenceMap[id]);
            this.sidebar.open();
        } else {
            log.error(`Unkown sidebar reference with id '${id}'. Maybe it was closed already"`);
        }
    }

    /**
     * This will just close the sidebar. All the reference will be saved.
     */
    public close() {
        this.sidebar.close();
    }

    /**
     * Close the sidebar and remove the reference.
     */
    public destroy<T>(sidebarRef: SidebarRef<T>) {
        this.sidebarContent.destroy(sidebarRef);
        delete this.referenceMap[sidebarRef.id];
        this.updateReferenceSubject();
    }

    /**
     * Event when the sidebar is fully open.
     */
    public get onOpen(): Observable<void> {
        return this.sidebar.onOpen;
    }

    /**
     * Event when the sidebar is closed.
     */
    public get onClosed(): Observable<void> {
        return  this.sidebar.onClose;
    }

    private updateReferenceSubject() {
        const references = this.computeReferenceList();
        this.referencesSubject.next(references);
    }

    private computeReferenceList(): Array<SidebarRef<any>> {
        return Object.keys(this.referenceMap).map(x => this.referenceMap[x]);
    }
}
