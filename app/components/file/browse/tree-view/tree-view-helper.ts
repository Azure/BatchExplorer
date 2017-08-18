import { List } from "immutable";
import * as path from "path";

import { File } from "app/models";
import { prettyBytes } from "app/utils";
import { FilterBuilder } from "app/utils/filter-builder";
import { FileState, TreeNodeData } from "./tree-component";
/**
 * Max treenodes number, default to 100 children
 */
export const MAX_TREENODES_ITEMS: number = 100;

/**
 * Helper function that builds tree options with maxItems and filter
 * @param path
 */
export function buildTreeRootFilter(path: string) {
    let options = {
        pageSize: MAX_TREENODES_ITEMS,
    };
    if (path) {
        options["filter"] = FilterBuilder.prop("name").startswith(path).toOData();
    }
    return options;
}

/**
 * Helper function that prettify file size
 * @param size raw file size
 */
export function prettyFileSize(size: string): string {
    // having falsy issues with contentLength = 0
    return prettyBytes(parseInt(size || "0", 10));
}

/**
 * Helper function that helps to append pretty file size after file name
 * @param file
 */
export function getNameFromPath(file: File): string {
    let tokens = standardizeFilePath(file.name).split("\/");
    let displayName = tokens[tokens.length - 1];
    if (!file.isDirectory) {
        displayName = `${displayName} (${prettyFileSize(file.properties.contentLength.toString())})`;
    }
    return displayName;
}

/**
 * Replace all '\' with '/' in given path
 * @param filePath
 */
export function standardizeFilePath(filePath: string): string {
    return filePath.replace(/\\/g, "/");
}

/**
 * Helper function that map File to tree nodes
 */
export function mapFilesToTree(files: List<File>, baseFolder: string = ""): TreeNodeData[] {
    const directories = {};

    for (let file of files.toArray()) {
        const node = fileToTreeNode(file);

        const folder = path.dirname(file.name);

        const relativePath = standardizeFilePath(path.relative(baseFolder, folder));

        checkDirInTree(directories, relativePath);

        if (file.isDirectory) {
            if (!directories[standardizeFilePath(file.name)]) {
                directories[standardizeFilePath(file.name)] = node;
                directories[relativePath].children.push(node);
            }
        } else {
            directories[relativePath].children.push(node);
        }
    }

    const root = directories[""];
    return root ? root.children : [];
}

function checkDirInTree(directories: StringMap<TreeNodeData>, directory: string) {
    if (directories[directory]) {
        return;
    }
    directories[directory] = generateDir(directory);

    const segments = directory.split("/");
    const parent = segments.slice(0, -1).join("/");
    if (directory !== parent) {
        checkDirInTree(directories, parent);
        directories[parent].children.push(directories[directory]);
    }
}

export function fileToTreeNode(file: File): TreeNodeData {
    return {
        name: getNameFromPath(file),
        fileName: standardizeFilePath(file.name),
        hasChildren: file.isDirectory,
        children: [] as TreeNodeData[],
        state: file.isDirectory ? FileState.EXPANDED_DIRECTORY : FileState.FILE,
    } as TreeNodeData;
}

function generateDir(dirname): TreeNodeData {
    return {
        name: path.basename(dirname),
        fileName: dirname,
        hasChildren: true,
        children: [] as TreeNodeData[],
        state: FileState.EXPANDED_DIRECTORY,
    } as TreeNodeData;
}

/** Sort tree node function */
export function sortFileNames(fileA: TreeNodeData, fileB: TreeNodeData) {
    return fileA.name.localeCompare(fileB.name);
}
