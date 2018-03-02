import { ModuleWithProviders, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@bl-common/core";

import { EditorModule } from "@bl-common/ui/editor";
import { ButtonsModule } from "../buttons";
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
    imports: [ButtonsModule, BrowserModule, MaterialModule, RouterModule, EditorModule],
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
