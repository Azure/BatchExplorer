import { Component, HostBinding, Input } from "@angular/core";

import "./property-list.scss";

@Component({
    selector: "bl-property-list",
    template: `<fieldset><ng-content></ng-content></fieldset>`,
})
export class PropertyListComponent {
}

@Component({
    selector: "bl-link-property",
    template: `
        <bl-property-field>
            <label>{{label}}</label>
            <a class="value link" [routerLink]="link" [title]="value">{{value}}</a>
        </bl-property-field>
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

@Component({
    selector: "bl-bool-property",
    template: `
        <bl-property-field>
            <div propertyLabel>{{label}}</div>
            <bl-property-content>
                <i class="fa" [class.fa-toggle-on]="value" [class.fa-toggle-off]="!value"></i>
                {{ text }}
            </bl-property-content>
        </bl-property-field>
    `,
})
export class BoolPropertyComponent {
    @Input()
    public label: string;

    @Input()
    @HostBinding("class.enabled")
    public value: boolean;

    @Input()
    public yesNo: boolean;

    public get text() {
        return this.yesNo
            ? (this.value ? "Yes" : "No")
            : (this.value ? "Enabled" : "Disabled");
    }
}
