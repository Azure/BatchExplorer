import { Component} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SidebarManager } from "../../base/sidebar";


@Component({
    selector: "bl-market-home",
    templateUrl: "market-home.html",
})
export class MarketHomeComponent {
    state='Page1';
    selected="";
    names = ["Maya Windows","Maya Linux","3DS Max Windows"];

    public static breadcrumb() {
        return { name: "Market" };
    }

    onClick(){
        
    }
    constructor(
        sidebarManager: SidebarManager,
        private activatedRoute: ActivatedRoute) {
            console.log("Entered Market");
    }
}
