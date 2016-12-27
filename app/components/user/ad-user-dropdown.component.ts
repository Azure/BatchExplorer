import { Component } from "@angular/core";

import { AdalService } from "app/services";


@Component({
    selector: "bex-ad-user-dropdown",
    templateUrl: "ad-user-dropdown",
})
export class AdUserDropdownComponent {
    public name: string;

    constructor(private adalService: AdalService) {
        adalService.currentUser.subscribe((user) => {
            if (user) {
                this.name = user.name;
            }
        });
    }

    public logout() {
        this.adalService.logout();
    }

}
