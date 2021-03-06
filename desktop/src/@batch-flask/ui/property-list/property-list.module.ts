import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { EditorModule } from "@batch-flask/ui/editor";
import { ButtonsModule } from "../buttons";
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
    LinkPropertyComponent,
    PropertyListComponent,
    PropertyGroupComponent,
    TextPropertyComponent,
    TablePropertyCellComponent,
    TablePropertyComponent,
    TablePropertyHeaderComponent,
    TablePropertyRowComponent,
    TablePropertyCellPlainComponent,
    EntityConfigurationComponent,
    DatePropertyComponent,
    PropertyFieldComponent,
    PropertyContentComponent,
];

const privateComponents = [
];

@NgModule({
    declarations: [...publicComponents, ...privateComponents],
    entryComponents: [],
    exports: publicComponents,
    imports: [I18nUIModule, ButtonsModule, CommonModule, MaterialModule, RouterModule, EditorModule],
})

export class PropertyListModule {
}
