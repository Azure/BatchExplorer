import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MaterialModule } from "@batch-flask/core";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { FormModule } from "@batch-flask/ui/form";
import { TagListComponent } from "./tag-list";
import { TagsComponent } from "./tags.component";

const privateComponents = [TagListComponent];
const publicComponents = [TagsComponent];

@NgModule({
    imports: [
        ButtonsModule,
        BrowserModule,
        FormsModule,
        MaterialModule,
        FormModule],
    declarations: [...privateComponents, ...publicComponents],
    exports: publicComponents,
})
export class TagsModule {

}
