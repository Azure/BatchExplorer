import { NgModule } from "@angular/core";

import { commonModules } from "app/common";

import { NodeConnectComponent } from "./node-connect.component";

const components = [
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
