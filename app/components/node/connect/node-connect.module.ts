import { NgModule } from "@angular/core";

import { commonModules } from "app/common";

import { DownloadRdpComponent } from "./download-rdp";
import { NodeConnectComponent } from "./node-connect.component";
import { NodeUserCredentialsFormComponent } from "./node-user-credentials-form.component";
import { SSHKeyPickerComponent } from "./ssh-key-picker.component";

const components = [
    DownloadRdpComponent,
    NodeConnectComponent,
    NodeUserCredentialsFormComponent,
    SSHKeyPickerComponent,
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
