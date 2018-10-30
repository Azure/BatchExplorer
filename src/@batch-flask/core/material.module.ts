import { PortalModule } from "@angular/cdk/portal";
import { NgModule } from "@angular/core";
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltipModule,
} from "@angular/material";

const modules = [
    MatButtonModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTabsModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatDialogModule,
    MatSidenavModule,
    PortalModule,
    MatNativeDateModule,
];

@NgModule({
    imports: modules,
    exports: modules,
})
export class MaterialModule { }
