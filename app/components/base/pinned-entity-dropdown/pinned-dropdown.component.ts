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

    private _subscriber: Subscription;

    constructor(
        private router: Router,
        public pinnedEntityService: PinnedEntityService) {
        this.favorites = pinnedEntityService.favorites;
    }

    public ngOnInit() {
        this._subscriber = this.router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe((event: NavigationEnd) => {

            // todo-andrew: use to select currently selected item
            console.log("Current URL: ", event.url);
        });
    }

    public ngOnDestroy() {
        this._subscriber.unsubscribe();
    }

    public entityType(favourite: PinnedEntity) {
        switch (favourite.type) {
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

    public entityIcon(favourite: PinnedEntity) {
        switch (favourite.type) {
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
