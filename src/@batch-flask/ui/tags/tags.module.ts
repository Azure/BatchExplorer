import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import { FormModule } from "@batch-flask/ui/form";
import { TagsComponent } from "./tags.component";

const components = [TagsComponent];

@NgModule({
    imports: [BrowserModule, FormsModule, MaterialModule, FormModule],
    declarations: components,
    exports: components,
})
export class TagsModule {

}
