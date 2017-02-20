import { NgModule } from "@angular/core";

import { commonModules } from "app/common";

import { DownloadRdpComponent } from "./download-rdp.component";
import { NodeConnectComponent } from "./node-connect.component";

const components = [
    DownloadRdpComponent,
    NodeConnectComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules],
    entryComponents: [
        NodeConnectComponent,
    ],
})
export class NodeConnectModule {
}
