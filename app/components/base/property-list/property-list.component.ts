import { Component, Input } from "@angular/core";

@Component({
    selector: "bl-property-list",
    template: `<fieldset><ng-content></ng-content></fieldset>`,
})
export class PropertyListComponent {
}

@Component({
    selector: "bl-link-property",
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
    selector: "bl-void-link-property",
    template: `
        <section class="one-line">
            <label>{{label}}</label>
            <a class="value link" href="javascript:void(0);">{{value}}</a>
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
    selector: "bl-bool-property",
    template: `
        <section class="one-line">
            <label>{{label}}</label>
            <span class="value">
                <i class="fa" [class.fa-check-circle]="value" [class.fa-times-circle]="!value"></i>
                {{ ValueSting }}
            </span>
        </section>
    `,
})
export class BoolPropertyComponent {
    @Input()
    public label: string;

    @Input()
    public value: boolean;

    @Input()
    public YesNo: boolean;

    private get ValueSting() {
        return this.YesNo
            ? (this.value ? "Yes" : "No")
            : (this.value ? "Enabled" : "Disabled");
    }
}
