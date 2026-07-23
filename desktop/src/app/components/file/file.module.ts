import { NgModule } from "@angular/core";
import { commonModules } from "app/common";
import { FileBrowseModule } from "app/components/file/browse";

const components = [];

const modules = [
    FileBrowseModule, ...commonModules,
];

@NgModule({
    declarations: components,
    exports: [...modules, ...components],
    imports: [...modules],
})
export class FileModule {
}
