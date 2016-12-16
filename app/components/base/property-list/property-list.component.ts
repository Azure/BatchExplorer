import { Component, Input } from "@angular/core";

@Component({
    selector: "bex-property-list",
    template: `<fieldset><ng-content></ng-content></fieldset>`,
})
export class PropertyListComponent {
}

@Component({
    selector: "bex-link-property",
    template: `
        <section class="one-line">
            <label>{{label}}</label>
            <a class="value link" [routerLink]="link">{{value}}</a>
        </section>
    `,
})
export class LinkPropertyComponent {
    @Input()
    public label: string;

    @Input()
    public value: string;

    @Input()
    public link: string;
}

// todo: only for testing, delete when we have task navigation working.
@Component({
    selector: "bex-void-link-property",
    template: `
        <section class="one-line">
            <label>{{label}}</label>
            <span class="value"><a href="javascript:void(0);">{{value}}</a></span>
        </section>
    `,
})
export class VoidLinkPropertyComponent {
    @Input()
    public label: string;

    @Input()
    public value: string;
}

@Component({
    selector: "bex-bool-property",
    template: `
        <section class="one-line">
            <label>{{label}}</label>
            <span class="value">
                <i class="fa" [class.fa-check-circle]="value" [class.fa-times-circle]="!value"></i>
                {{value ? "Enabled" : "Disabled"}}
            </span>
        </section>
    `,
})
export class BoolPropertyComponent {
    @Input()
    public label: string;

    @Input()
    public value: boolean;
}
