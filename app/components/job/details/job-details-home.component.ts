import { Component } from "@angular/core";
import { NotificationService } from "../../base/notifications";

@Component({
    selector: "bex-job-details-home",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-database"></i>
            <p>Please select a job from the list</p>

            <button md-raised-button (click)="success(false)">Success not persist</button>
            <button md-raised-button (click)="success(true)">Success</button>
            <button md-raised-button (click)="info()">Info</button>
            <button md-raised-button color="warn" (click)="warn()">Warn</button>
            <button md-raised-button color="warn" (click)="error()">Error</button>
        </div>
    `,
})

export class JobDetailsHomeComponent {
    public static breadcrumb() {
        return { name: "Job" };
    }

    constructor(public notif: NotificationService) {

    }

    public success(persist) {
        const message = persist ? "persist" : "not persist";
        this.notif.success("Succeeded", `Awesome this will ${message}`, {
            persist: persist,
        });
    }

    public error() {
        this.notif.error("Error bad stuff happened",
            "Font Awesome is always getting a little awesome-er. So here's what's new in the latest version", {
                persist: true,
            });
    }

    public warn() {
        this.notif.warn("Warning something happend",
            "Pre-order and get Font Awesome 5 Pro and ALL stretch goals for ju", {
                persist: true,
            });
    }

    public info() {
        this.notif.info("Info something happened",
            "After you get up and running, you can place Font Awesome icons just about anywhere with", {
                persist: true,
            });
    }
}
