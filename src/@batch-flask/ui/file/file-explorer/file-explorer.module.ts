import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { FileViewerModule } from "@batch-flask/ui/file/file-viewer";
import { FocusSectionModule } from "@batch-flask/ui/focus-section";
import { LoadingModule } from "@batch-flask/ui/loading";
import { QuickListModule } from "@batch-flask/ui/quick-list";
import { SplitPaneModule } from "@batch-flask/ui/split-pane";
import { TableModule } from "@batch-flask/ui/table";
import { FileExplorerTabsComponent } from "./file-explorer-tabs";
import { FileExplorerComponent } from "./file-explorer.component";
import { FileTableViewComponent } from "./file-table-view";
import { FilePathNavigatorComponent } from "./file-table-view/file-path-navigator";
import { FileTreeViewComponent, FileTreeViewRowComponent } from "./file-tree-view";

const privateComponents = [FileTreeViewRowComponent, FilePathNavigatorComponent];
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
        QuickListModule,
        FileViewerModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    declarations: [...privateComponents, publicComponents],
    exports: publicComponents,
})
export class FileExplorerModule {

}
