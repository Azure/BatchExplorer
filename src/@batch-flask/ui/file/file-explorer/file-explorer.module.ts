import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { FileDetailsModule } from "@batch-flask/ui/file/details";
import { FocusSectionModule } from "@batch-flask/ui/focus-section";
import { LoadingModule } from "@batch-flask/ui/loading";
import { SplitPaneModule } from "@batch-flask/ui/split-pane";
import { TableModule } from "@batch-flask/ui/table";
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
    imports: [
        BrowserModule,
        ButtonsModule,
        FocusSectionModule,
        SplitPaneModule,
        LoadingModule,
        TableModule,
        FileDetailsModule,
    ],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class FileExplorerModule {

}
