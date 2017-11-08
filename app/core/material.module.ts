import { PortalModule } from "@angular/cdk/portal";
import { NgModule } from "@angular/core";
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatTooltipModule,
} from "@angular/material";

const modules = [
    MatButtonModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTabsModule,
    MatTooltipModule,
    MatIconModule,
    MatSelectModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSidenavModule,
    MatCardModule,
    MatInputModule,
    PortalModule,
];

@NgModule({
    imports: modules,
    exports: modules,
})
export class MaterialModule { }
