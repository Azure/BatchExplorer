import { Component } from "@angular/core";

import { AdalService } from "app/services";

@Component({
    selector: "bl-aad-user-dropdown",
    templateUrl: "aad-user-dropdown.html",
})
export class AADUserDropdownComponent {
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
