import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";

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
        BrowserModule,
        FormsModule,
        MaterialModule,
    ],
    providers: [
        ScrollableService,
    ]
})
export class ScrollableModule {
}
