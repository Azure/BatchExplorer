import { Injectable } from "@angular/core";
import { FileSystemService } from "app/services";
import * as path from "path";

const dataUrl = "https://github.com/Azure/BatchLabs-data/archive/ncj.zip";

@Injectable()
export class NcjTemplateService {
    constructor(private fs: FileSystemService) { }

    public init() {
        console.log("Downloading ncj data");
        const tmpZip = path.join(this.fs.commonFolders.temp, "batch-labs-data.zip");
        const dest = path.join(this.fs.commonFolders.temp, "batch-labs-data");
        console.log("Destination", dest);
        return this.fs.download(dataUrl, tmpZip).then(() => {
            return this.fs.unzip(tmpZip, dest);
        });
    }
}
