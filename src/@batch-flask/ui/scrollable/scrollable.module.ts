import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@batch-flask/core";

import { ScrollableComponent } from "./scrollable.component";
import { ScrollableService } from "./scrollable.service";

@NgModule({
    declarations: [
        ScrollableComponent,
    ],
    exports: [
        ScrollableComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
    ],
    providers: [
        ScrollableService,
    ],
})
export class ScrollableModule {
}
