import { Pipe, PipeTransform } from "@angular/core";
import { List } from "immutable";

import { File, NodeFileTypes } from "app/models";

@Pipe({name: "fileTypeFilter"})
export class FileTypeFilter implements PipeTransform {
    public transform(files: List<File>, fileTypeFilter: any): any {
        switch(fileTypeFilter) {
            case NodeFileTypes.ApplicationPackage:
            return files.filter(file => file.name.startsWith("applications"));
            case NodeFileTypes.StartTask:
            return files.filter(file => file.name.startsWith("startup"));
            case NodeFileTypes.Task:
            return files.filter(file => file.name.startsWith("workitems"));
            default:
            return files;           
        }
    }
}
