import { Component, ContentChild, Input, TemplateRef, ViewChild } from "@angular/core";

@Component({
    selector: "bex-tab-label",
    template: "<template><ng-content></ng-content></template>",
})
export class TabLabelComponent {
    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;
}

@Component({
    selector: "bex-tab",
    template: "<template><ng-content></ng-content></template>",
})
export class TabComponent {
    /**
     * Unique key
     */
    @Input()
    public key: string;

    @ContentChild(TabLabelComponent)
    public label: TemplateRef<any>;

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;
}

