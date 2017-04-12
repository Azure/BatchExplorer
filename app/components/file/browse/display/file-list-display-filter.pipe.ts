import { Pipe, PipeTransform } from "@angular/core";
import { List } from "immutable";

import { File } from "app/models";

@Pipe({name: "fileDirectoryFilter"})
export class FileDirectoryFilter implements PipeTransform {
    public transform(files: List<File>, args: any[]): any {
        return files.filter(file => file.isDirectory === false);
    }
}
