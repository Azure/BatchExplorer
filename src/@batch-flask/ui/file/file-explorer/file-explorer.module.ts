import { NgModule } from "@angular/core";
import { FileDetailsModule } from "@batch-flask/ui/file/details";
import { FileExplorerTabsComponent } from "./file-explorer-tabs";
import { FileExplorerComponent } from "./file-explorer.component";
import { FileTableViewComponent } from "./file-table-view";
import { FileTreeViewComponent, FileTreeViewRowComponent } from "./file-tree-view";

const privateComponents = [FileTreeViewRowComponent];
const publicComponents = [
    FileTreeViewComponent,
    FileExplorerComponent,
    FileTableViewComponent,
    FileExplorerTabsComponent,
];

@NgModule({
    imports: [FileDetailsModule],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class FileExplorerModule {

}
