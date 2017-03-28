import { Pipe, PipeTransform } from "@angular/core";
import { List } from "immutable";

import { File } from "app/models";

@Pipe({name: "fileDirectoryFilter"})
export class FileDirectoryFilter implements PipeTransform {
    public transform(files: List<File>, args: any[]): any {
        // TODO: Tim is this ok? files is null when not using an RxProxy (it would seem ...)
        // though could be another issue, will revisit when it's actually loading blobs
        return files ? files.filter(file => file.isDirectory === false) : [];
    }
}
