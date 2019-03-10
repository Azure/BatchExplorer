import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { BaseModule } from "@batch-flask/ui";
import { TaskBaseModule } from "app/components/task/base";
import { InboundNATPoolPickerComponent } from "./inbound-nat-pool-picker.component";
import { NetworkSecurityGroupRulesComponent } from "./network-security-group-rules.component";
import { VirtualNetworkPickerComponent } from "./virtual-network-picker";

const components = [InboundNATPoolPickerComponent, NetworkSecurityGroupRulesComponent, VirtualNetworkPickerComponent];

@NgModule({
    declarations: components,
    exports: components,
    imports: [CommonModule, MaterialModule, RouterModule, FormsModule, ReactiveFormsModule,
        BaseModule, TaskBaseModule],
    entryComponents: [InboundNATPoolPickerComponent],
})
export class NetworkConfigurationModule {

}
