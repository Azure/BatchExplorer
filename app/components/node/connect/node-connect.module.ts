import { NgModule } from "@angular/core";

import { commonModules } from "app/common";

import { NodeConnectComponent } from "./node-connect.component";
import { NodeUserCredentialsFormComponent } from "./node-user-credentials-form.component";
import { NodePropertyDisplayComponent } from "./property-display";
import { SSHKeyPickerComponent } from "./ssh-key-picker";

const components = [
    NodeConnectComponent,
    NodeUserCredentialsFormComponent,
    SSHKeyPickerComponent,
    NodePropertyDisplayComponent,
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
