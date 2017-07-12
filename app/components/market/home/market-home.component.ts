import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SidebarManager } from "../../base/sidebar";


@Component({
    selector: "bl-market-home",
    templateUrl: "market-home.html",
})
export class MarketHomeComponent {
    public static breadcrumb() {
        return { name: "Market" };
    }
    constructor(
        sidebarManager: SidebarManager,
        private activatedRoute: ActivatedRoute) {
            console.log("Entered Market");
    }
}
