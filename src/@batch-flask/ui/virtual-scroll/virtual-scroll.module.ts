
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { VirtualScrollTailComponent } from "./virtual-scroll-tail";
import { VirtualScrollComponent } from "./virtual-scroll.component";

const publicComponents = [VirtualScrollTailComponent, VirtualScrollComponent];

@NgModule({
    imports: [BrowserModule],
    exports: publicComponents,
    declarations: publicComponents,
})
export class VirtualScrollModule { }
