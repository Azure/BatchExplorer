import { Component, Input, TemplateRef, ViewChild } from "@angular/core";

export enum EditableTableColumnType {
    /**
     * Text input
     */
    Text = "text",

    /**
     * Numeric text input
     */
    Number = "number",

    /**
     * Dropdown menu
     */
    Select = "select",
}

let idCounter = 0;

@Component({
    selector: "bl-editable-table-column",
    template: `<ng-template><ng-content></ng-content></ng-template>`,
})
export class EditableTableColumnComponent {
    @Input() public id = `bl-editable-table-column-${idCounter++}`;
    @Input() public name: string;

    @Input() public type: EditableTableColumnType = EditableTableColumnType.Text;

    /** Select options when type is EditableTableColumnType.Select */
    @Input() public options: string[];

    @ViewChild(TemplateRef) public content: TemplateRef<any>;
}
