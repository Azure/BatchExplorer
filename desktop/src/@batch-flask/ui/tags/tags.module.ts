import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
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
        CommonModule,
        FormsModule,
        MaterialModule,
        FormModule],
    declarations: [...privateComponents, ...publicComponents],
    exports: publicComponents,
})
export class TagsModule {

}
