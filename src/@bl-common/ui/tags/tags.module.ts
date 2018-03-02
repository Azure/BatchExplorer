import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "app/core";
import { TagsComponent } from "./tags.component";

const components = [TagsComponent];

@NgModule({
    imports: [BrowserModule, FormsModule, MaterialModule],
    declarations: components,
    exports: components,
})
export class TagsModule {

}
