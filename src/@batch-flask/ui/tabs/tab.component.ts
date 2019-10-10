import { Component, ContentChild, Input, TemplateRef, ViewChild } from "@angular/core";

@Component({
    selector: "bl-tab-label",
    template: "<ng-template><ng-content></ng-content></ng-template>",
})
export class TabLabelComponent {
    @ViewChild(TemplateRef, { static: false })
    public content: TemplateRef<any>;
}

@Component({
    selector: "bl-tab",
    template: "<ng-template><ng-content></ng-content></ng-template>",
})
export class TabComponent {
    /**
     * Unique key
     */
    @Input()
    public key: string;
    /**
     * Disabled
     */
    @Input()
    public disabled: boolean;

    @ContentChild(TabLabelComponent, {static: true})
    public label: TemplateRef<any>;

    @ViewChild(TemplateRef, { static: true })
    public content: TemplateRef<any>;
}
