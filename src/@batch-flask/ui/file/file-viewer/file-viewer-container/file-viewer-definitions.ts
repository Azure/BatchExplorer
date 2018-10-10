import { CodeFileViewerComponent } from "../code-file-viewer";
import { ImageFileViewerComponent } from "../image-file-viewer";
import { LogFileViewerComponent } from "../log-file-viewer";

export const FILE_VIEWER_DEFINITIONS = {
    log: LogFileViewerComponent,
    code: CodeFileViewerComponent,
    image: ImageFileViewerComponent,
};
