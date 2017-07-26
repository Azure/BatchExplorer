import { Component, OnInit } from "@angular/core";
import { List } from "immutable";

import { Application } from "app/models";
import { NcjTemplateService } from "app/services";
import "./market.scss";

@Component({
    selector: "bl-market",
    templateUrl: "market.html",
})
export class MarketComponent implements OnInit {
    public applications: List<Application>;

    constructor(private templateService: NcjTemplateService) { }
    public static breadcrumb() {
        return { name: "Market" };
    }
    public ngOnInit() {
        this.templateService.listApplications().subscribe((applications) => {
            this.applications = applications;
        });
    }
}
