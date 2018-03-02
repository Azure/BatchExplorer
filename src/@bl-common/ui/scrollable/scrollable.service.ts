import { Injectable } from "@angular/core";

import { ScrollableComponent } from "./scrollable.component";

@Injectable()
export class ScrollableService {
    private _map: { [id: string]: ScrollableComponent } = {};

    public registerScrollable(scrollable: ScrollableComponent) {
        this._map[scrollable.id] = scrollable;
    }

    public unregisterScrollable(scrollable: ScrollableComponent) {
        delete this._map[scrollable.id];
    }

    public getParentSrollable(nativeElement: any) {
        if (!nativeElement) {
            return null;
        }
        let current = nativeElement;
        while (current) {
            current = current.parentElement;
            if (!current) {
                return null;
            }
            if (current.nodeName === "BL-SCROLLABLE") {
                const id = current.getAttributeNode("sid").value;
                return this._map[id];
            }
        }
    }
}
