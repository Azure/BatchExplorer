import { CommonModule as NgCommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@batch-flask/core";
import { BaseModule } from "@batch-flask/ui";
import { EditMetadataFormComponent } from "./edit-metadata-form";
import { GuardsModule } from "./guards";
import { InlineQuotaComponent } from "./inline-quota";
import { LocationModule } from "./location";
import { LocationPickerModule } from "./location-picker";
import { ReactContainerComponent } from "./react-container/react-container.component";
import { SubscriptionPickerComponent } from "./subscription-picker";

const privateComponents = [];

const publicComponents = [
    EditMetadataFormComponent,
    InlineQuotaComponent,
    ReactContainerComponent,
    SubscriptionPickerComponent,
];

const publicModules = [
    GuardsModule,
    LocationModule,
    LocationPickerModule,
];

/**
 * Commons module shouldn't import any module that:
 *  - are not external dependencies
 *  - BaseModule and other Common components are the only exceptions.
 */
@NgModule({
    imports: [NgCommonModule, BaseModule, FormsModule, ReactiveFormsModule, MaterialModule, ...publicModules],
    declarations: [...privateComponents, publicComponents],
    exports: [...publicComponents, ...publicModules],
    entryComponents: [EditMetadataFormComponent],
})
export class CommonModule {

}
