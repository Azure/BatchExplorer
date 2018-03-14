import { NgModule } from "@angular/core";

import { commonModules } from "app/common";
import { DataSharedModule } from "app/components/data/shared";
import { UploadNodeLogsDialogComponent } from "./upload-node-logs";

const privateComponents = [];
const publicComponents = [
    UploadNodeLogsDialogComponent,
];

@NgModule({
    imports: [...commonModules, DataSharedModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
    entryComponents: [
        UploadNodeLogsDialogComponent,
    ],
})
export class NodeActionModule {

}
