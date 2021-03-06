import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FileExplorerModule } from "@batch-flask/ui";
import { BlobFilesBrowserComponent } from "./blob-files-browser.component";

const publicComponents = [BlobFilesBrowserComponent];
const privateComponents = [];

@NgModule({
    imports: [
        CommonModule,
        FileExplorerModule,
    ],
    declarations: [...publicComponents, ...privateComponents],
    exports: publicComponents,
    entryComponents: [],
})
export class BlobFilesBrowserModule {
}
