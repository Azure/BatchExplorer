import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { PinnedEntity, PinnedEntityType } from "app/models";
import { PinnedEntityService } from "app/services";

import "./pinned-dropdown.scss";

@Component({
    selector: "bl-pinned-dropdown",
    templateUrl: "pinned-dropdown.html",
})
export class PinnedDropDownComponent implements OnInit, OnDestroy {
    public selectedId: string;
    public favorites: Observable<List<PinnedEntity>>;
    public title: string = "";

    private _subscriptions: Subscription[] = [];

    constructor(
        private router: Router,
        public pinnedEntityService: PinnedEntityService) {
        this.favorites = pinnedEntityService.favorites;
        this._subscriptions.push(this.favorites.subscribe((items) => {
            this.title = items.size > 0 ? `${items.size} pinned favorites` : "No favorites pinned";
        }));
    }

    public ngOnInit() {
        this._subscriptions.push(this.router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe((event: NavigationEnd) => {

            // todo-andrew: use to select currently selected item
            console.log("Current URL: ", event.url);
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(x => x.unsubscribe());
    }

    // public get title(): string {
    //     // return this.favorites.si;
    // }

    public entityType(favorite: PinnedEntity) {
        switch (favorite.pinnableType) {
            case PinnedEntityType.Job:
                return "Batch job";
            case PinnedEntityType.Task:
                return "Batch task";
            case PinnedEntityType.Pool:
                return "Batch pool";
            case PinnedEntityType.Node:
                return "Compute node";
            default:
                return "unknown";
        }
    }

    public entityIcon(favorite: PinnedEntity) {
        switch (favorite.pinnableType) {
            case PinnedEntityType.Job:
            case PinnedEntityType.Task:
                return "fa-tasks";
            case PinnedEntityType.Pool:
            case PinnedEntityType.Node:
                return "fa-database";
            default:
                return "fa-question";
        }
    }
}
