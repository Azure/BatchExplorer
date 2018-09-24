import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import { BaseModule } from "@batch-flask/ui";
import { EditMetadataFormComponent } from "./edit-metadata-form";
import { GuardsModule } from "./guards";
import { InlineQuotaComponent } from "./inline-quota";
import { LocationModule } from "./location";
import { SubscriptionPickerComponent } from "./subscription-picker";

const privateComponents = [];

const publicComponents = [
    EditMetadataFormComponent,
    InlineQuotaComponent,
    SubscriptionPickerComponent,
];

const publicModules = [
    GuardsModule,
    LocationModule,
];

/**
 * Commons module shouldn't import any module that:
 *  - are not external dependencies
 *  - BaseModule and other Common components are the only exceptions.
 */
@NgModule({
    imports: [BrowserModule, BaseModule, FormsModule, ReactiveFormsModule, MaterialModule, ...publicModules],
    declarations: [...privateComponents, publicComponents],
    exports: [...publicComponents, ...publicModules],
    entryComponents: [EditMetadataFormComponent],
})
export class CommonModule {

}
