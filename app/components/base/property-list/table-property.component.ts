import { Component, ContentChild, ContentChildren, Input, QueryList, TemplateRef, ViewChild } from "@angular/core";

@Component({
    selector: "bex-table-property-header",
    template: `
        <template><ng-content></ng-content></template>
    `,
})
export class TablePropertyHeaderComponent {
    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;
}

@Component({
    selector: "bex-table-property-row",
   template: `
        <template><ng-content></ng-content></template>
    `,
})
export class TablePropertyRowComponent {
    @Input()
    public label: string;

    @ViewChild(TemplateRef)
    public content: TemplateRef<any>;

}

@Component({
    selector: "bex-table-property",
    template: `
        <section>
            <table>
                <tr>
                    <td class="label">{{label}}</td>
                    <template [ngTemplateOutlet]="header.content"></template>
                </tr>

                <tr *ngFor="let row of rows" class="row">
                    <td class="label">{{row.label}}</td>
                    <template [ngTemplateOutlet]="row.content"></template>
                </tr>
            </table>
        </section>
    `,
})
export class TablePropertyComponent {
    @Input()
    public label: string;

    @ContentChild(TablePropertyHeaderComponent)
    public header: TablePropertyHeaderComponent;

    @ContentChildren(TablePropertyRowComponent)
    public rows: QueryList<TablePropertyRowComponent>;
}
