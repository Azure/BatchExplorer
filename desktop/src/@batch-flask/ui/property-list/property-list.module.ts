import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { EditorModule } from "@batch-flask/ui/editor";
import { ButtonsModule } from "../buttons";
import { CopyableModule } from "../copyable";
import { I18nUIModule } from "../i18n";
import { BoolPropertyComponent } from "./bool-property";
import { DatePropertyComponent } from "./date-property";
import { EntityConfigurationComponent } from "./entity-configuration";
import { LinkPropertyComponent } from "./link-property";
import { PropertyContentComponent } from "./property-content";
import { PropertyFieldComponent } from "./property-field";
import { PropertyGroupComponent } from "./property-group";
import { PropertyListComponent } from "./property-list.component";
import {
    TablePropertyCellComponent,
    TablePropertyCellPlainComponent,
    TablePropertyComponent,
    TablePropertyHeaderComponent,
    TablePropertyRowComponent,
} from "./table-property";
import { TextPropertyComponent } from "./text-property";

const publicComponents = [
    BoolPropertyComponent,
    DatePropertyComponent,
    EntityConfigurationComponent,
    LinkPropertyComponent,
    PropertyContentComponent,
    PropertyFieldComponent,
    PropertyGroupComponent,
    PropertyListComponent,
    TablePropertyCellComponent,
    TablePropertyCellPlainComponent,
    TablePropertyComponent,
    TablePropertyHeaderComponent,
    TablePropertyRowComponent,
    TextPropertyComponent,
];

const privateComponents = [
];

@NgModule({
    declarations: [...publicComponents, ...privateComponents],
    entryComponents: [],
    exports: publicComponents,
    imports: [
        ButtonsModule,
        CommonModule,
        CopyableModule,
        EditorModule,
        I18nUIModule,
        MaterialModule,
        RouterModule
    ],
})

export class PropertyListModule {
}
