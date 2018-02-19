import { ModuleWithProviders, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

import { EditorModule } from "app/components/base/editor";
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

// TODO-TIM separate private and public

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
