import {
    Injectable,
    Injector,
    OnDestroy,
    Type,
} from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { log } from "@batch-flask/utils";
import { BehaviorSubject, Observable } from "rxjs";
import { map, publishReplay, refCount } from "rxjs/operators";
import { SidebarContentComponent } from "./sidebar-content";
import { SidebarRef } from "./sidebar-ref";

@Injectable({ providedIn: "root" })
export class GlobalSidebarService implements OnDestroy {
    public references: Observable<Array<SidebarRef<any>>>;

    public sidebarContent: SidebarContentComponent = null;
    public sidebar: MatSidenav = null;

    private _references: BehaviorSubject<Map<string, SidebarRef<any>>>
        = new BehaviorSubject(new Map<string, SidebarRef<any>>());

    constructor() {
        this.references = this._references.pipe(
            map(x => [...x.values()]),
            publishReplay(1),
            refCount(),
        );
    }

    public ngOnDestroy() {
        this._references.unsubscribe();
    }

    public has(id: string): boolean {
        return this._references.value.has(id);
    }

    public get(id: string): SidebarRef<any> {
        return this._references.value.get(id);
    }

    public delete(id: string): boolean {
        const references = this._references.value;
        const result = references.delete(id);
        this._references.next(references);
        return result;
    }

    public set(id: string, ref: SidebarRef<any>) {
        const references = this._references.value;
        this._references.value.set(id, ref);
        this._references.next(references);
    }
}

@Injectable()
export class SidebarManager {
    constructor(private reference: GlobalSidebarService, private injector: Injector) {
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
        if (this.reference.has(id)) {
            sidebarRef = this.reference.get(id);
            openNew = resetOnReOpen;
        } else {
            sidebarRef = new SidebarRef<T>(this, id);
            this.reference.set(id, sidebarRef);
        }

        // If the component was already init before and we don't want to create a new one
        if (openNew) {
            this.reference.sidebarContent.open(componentType, sidebarRef, this.injector);
        } else {
            this.reference.sidebarContent.display(sidebarRef);
        }

        this.reference.sidebar.open();

        return sidebarRef;
    }

    public reopen<T>(sidebarRef: SidebarRef<T>) {
        const id = sidebarRef.id;
        if (this.reference.has(id)) {
            this.reference.sidebarContent.display(this.reference.get(id));
            this.reference.sidebar.open();
        } else {
            log.error(`Unkown sidebar reference with id '${id}'. Maybe it was closed already"`);
        }
    }

    /**
     * This will just close the sidebar. All the reference will be saved.
     */
    public close() {
        this.reference.sidebar.close();
    }

    /**
     * Close the sidebar and remove the reference.
     */
    public destroy<T>(sidebarRef: SidebarRef<T>) {
        this.reference.sidebarContent.destroy(sidebarRef);
        this.reference.delete(sidebarRef.id);
    }

    /**
     * Event when the sidebar is fully open.
     */
    public get onOpen(): Observable<void> {
        return this.reference.sidebar.openedStart;
    }

    /**
     * Event when the sidebar is closed.
     */
    public get onClosed(): Observable<void> {
        return this.reference.sidebar.closedStart;
    }
}
