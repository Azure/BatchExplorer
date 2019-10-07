import { Component, Input, TemplateRef, ViewChild } from "@angular/core";
import { List } from "immutable";
import { OperatorFunction } from "rxjs";

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

export type PipeableSelectOptions = OperatorFunction<StringMap<any>, string[]>;
export type EditableTableSelectOptions = string[] | List<string> |  (() => PipeableSelectOptions);

@Component({
    selector: "bl-editable-table-column",
    template: `<ng-template><ng-content></ng-content></ng-template>`,
})
export class EditableTableColumnComponent {
    @Input() public id = `bl-editable-table-column-${idCounter++}`;
    @Input() public name: string;
    @Input() public default: any;

    @Input() public type: EditableTableColumnType = EditableTableColumnType.Text;

    /** Select options when type is EditableTableColumnType.Select */
    @Input() public options: EditableTableSelectOptions;

    @ViewChild(TemplateRef, { static: false }) public content: TemplateRef<any>;
}
