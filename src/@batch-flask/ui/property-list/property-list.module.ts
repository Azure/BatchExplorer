import { CommonModule } from "@angular/common";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";

import { EditorModule } from "@batch-flask/ui/editor";
import { ButtonsModule } from "../buttons";
import { I18nUIModule } from "../i18n";
import { BoolPropertyComponent } from "./bool-property";
import { EntityConfigurationComponent } from "./entity-configuration";
import { LinkPropertyComponent } from "./link-property";
import { PropertyContentComponent } from "./property-content";
import { PropertyFieldComponent } from "./property-field";
import { PropertyGroupComponent } from "./property-group";
import { PropertyListComponent } from "./property-list.component";
import {
    TablePropertyCellComponent, TablePropertyComponent, TablePropertyHeaderComponent, TablePropertyRowComponent,
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
    EntityConfigurationComponent,
];

const privateComponents = [
    PropertyFieldComponent,
    PropertyContentComponent,
];

@NgModule({
    declarations: [...publicComponents, ...privateComponents],
    entryComponents: [],
    exports: publicComponents,
    imports: [I18nUIModule, ButtonsModule, CommonModule, MaterialModule, RouterModule, EditorModule],
    providers: [],
})

export class PropertyListModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: PropertyListModule,
            providers: [],
        };
    }
}
