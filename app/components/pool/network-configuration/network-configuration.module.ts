import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

import { BaseModule } from "app/components/base";
import { TaskBaseModule } from "app/components/task/base";
import { InboundNATPoolPickerComponent } from "./inbound-nat-pool-picker.component";
import { NetworkSecurityGroupRulesComponent } from "./network-security-group-rules.component";
import { VirtualNetworkPickerComponent } from "./virtual-network-picker.component";

const components = [InboundNATPoolPickerComponent, NetworkSecurityGroupRulesComponent, VirtualNetworkPickerComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [BrowserModule, MaterialModule, RouterModule, FormsModule, ReactiveFormsModule,
        BaseModule, TaskBaseModule],
    entryComponents: [InboundNATPoolPickerComponent],
})
export class NetworkConfigurationModule {

}
