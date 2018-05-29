import { Component, ContentChild, Input, TemplateRef, ViewChild } from "@angular/core";

@Component({
    selector: "bl-tab-label",
    template: "<ng-template><ng-content></ng-content></ng-template>",
})
export class TabLabelComponent {
    @ViewChild(TemplateRef)
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

    @ContentChild(TabLabelComponent)
    public label: TemplateRef<any>;

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;
}
