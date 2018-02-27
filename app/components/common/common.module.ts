import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { BaseModule } from "app/components/base";
import { InlineQuotaComponent } from "./inline-quota";

const privateComponents = [];
const publicComponents = [InlineQuotaComponent];

/**
 * Commons module shouldn't import any module that:
 *  - are not external dependencies
 *  - BaseModule and other Common components are the only exceptions.
 */
@NgModule({
    imports: [BrowserModule, BaseModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class CommonModule {

}
