
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { VirtualScrollRowDirective } from "./virtual-scroll-row.directive";
import { VirtualScrollTailComponent } from "./virtual-scroll-tail";
import { VirtualScrollComponent } from "./virtual-scroll.component";

const publicComponents = [VirtualScrollTailComponent, VirtualScrollComponent, VirtualScrollRowDirective];

@NgModule({
    imports: [CommonModule],
    exports: publicComponents,
    declarations: publicComponents,
})
export class VirtualScrollModule { }
