import { Component, Input, TemplateRef, ViewChild } from "@angular/core";

@Component({
    selector: "bl-editable-table-column",
    template: `<ng-template><ng-content></ng-content></ng-template>`,
})
export class EditableTableColumnComponent {
    @Input() public name: string;

    @Input() public type: string = "text";

    @ViewChild(TemplateRef) public content: TemplateRef<any>;
}
