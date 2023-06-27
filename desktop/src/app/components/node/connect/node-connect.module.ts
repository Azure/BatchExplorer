import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { NodeConnectComponent } from "./node-connect.component";
import { NodePropertyDisplayComponent } from "./property-display";
import { SSHKeyPickerComponent } from "./ssh-key-picker";
import { SSHKeyPickerDialogComponent } from "./ssh-key-picker-dialog";

const components = [
    NodeConnectComponent,
    SSHKeyPickerComponent,
    SSHKeyPickerDialogComponent,
    NodePropertyDisplayComponent,
];

@NgModule({
    declarations: components,
    exports: components,
    imports: [...commonModules],
    entryComponents: [
        NodeConnectComponent,
        SSHKeyPickerDialogComponent,
    ],
})
export class NodeConnectModule {
}
