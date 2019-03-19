import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { BlobContainerPickerModule } from "app/components/common";
import { UploadNodeLogsDialogComponent } from "./upload-node-logs";

const privateComponents = [];
const publicComponents = [
    UploadNodeLogsDialogComponent,
];

@NgModule({
    imports: [...commonModules, BlobContainerPickerModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
    entryComponents: [
        UploadNodeLogsDialogComponent,
    ],
})
export class NodeActionModule {

}
