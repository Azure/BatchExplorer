import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { QuickListModule, ToolbarModule } from "@batch-flask/ui";
import { LocationModule } from "app/components/common/location";
import { SelectAccountDialogComponent } from "./select-account-dialog.component";

const publicComponents = [SelectAccountDialogComponent];
const privateComponents = [];

@NgModule({
    imports: [CommonModule, QuickListModule, LocationModule, ToolbarModule],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [SelectAccountDialogComponent],
})
export class SelectAccountDialogModule {
}
