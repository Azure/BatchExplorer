import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@batch-flask/core";
import { BaseModule } from "@batch-flask/ui";
import { DownloadFolderComponent } from "./download-folder-dialog";
import { EditMetadataFormComponent } from "./edit-metadata-form";
import { GuardsModule } from "./guards";
import { InlineQuotaComponent } from "./inline-quota";
import { SubscriptionPickerComponent } from "./subscription-picker";

const privateComponents = [];

const publicComponents = [
    InlineQuotaComponent,
    EditMetadataFormComponent,
    DownloadFolderComponent,
    SubscriptionPickerComponent,
];

const publicModules = [
    GuardsModule,
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
    entryComponents: [EditMetadataFormComponent, DownloadFolderComponent],
})
export class CommonModule {

}
