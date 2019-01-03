import { Component, Input } from "@angular/core";

@Component({
    selector: "bl-application-preview",
    templateUrl: "application-preview.html",
})

/**
 * Display preview information about an application.
 */
export class ApplicationPreviewComponent {
    @Input()
    public application: any;
}
