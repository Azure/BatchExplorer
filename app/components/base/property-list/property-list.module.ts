import { ModuleWithProviders, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

import {
    BoolPropertyComponent,
    LinkPropertyComponent,
    PropertyListComponent,
} from "./property-list.component";

import {
    PropertyGroupComponent,
} from "./property-group.component";

import { EditorModule } from "app/components/base/editor";
import { ButtonsModule } from "../buttons";
import { EntityConfigurationComponent } from "./entity-configuration";
import { PropertyContentComponent } from "./property-content";
import { PropertyFieldComponent } from "./property-field";
import {
    TablePropertyCellComponent, TablePropertyComponent, TablePropertyHeaderComponent, TablePropertyRowComponent,
} from "./table-property";
import { TextPropertyComponent } from "./text-property";

// TODO-TIM separate private and public
const components = [
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
    PropertyFieldComponent,
    PropertyContentComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [],
    exports: [...components],
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
