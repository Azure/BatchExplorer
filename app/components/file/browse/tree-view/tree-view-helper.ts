import { List } from "immutable";
import * as path from "path";

import { File } from "app/models";
import { prettyBytes } from "app/utils";
import { FilterBuilder } from "app/utils/filter-builder";
import { FileState, TreeNodeData } from "./tree-view.model";
/**
 * Max treenodes number, default to 1000 children
 */
export const MAX_TREENODES_ITEMS: number = 1000;

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
 * Helper function that map File to tree nodes. It will build the nested data structure
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

    for (let dir of Object.keys(directories)) {
        directories[dir].children = sortTreeNodes(directories[dir].children);
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
    const fullPath = standardizeFilePath(file.name);
    return {
        id: fullPath,
        name: getNameFromPath(file),
        fileName: fullPath,
        hasChildren: file.isDirectory,
        children: [] as TreeNodeData[],
        state: file.isDirectory ? FileState.COLLAPSED_DIRECTORY : FileState.FILE,
    };
}

function generateDir(dirname): TreeNodeData {
    return {
        id: dirname,
        name: path.basename(dirname),
        fileName: dirname,
        hasChildren: true,
        children: [] as TreeNodeData[],
        state: FileState.COLLAPSED_DIRECTORY,
    };
}

function sortTreeNodes(nodes: TreeNodeData[]): TreeNodeData[] {
    return nodes.sort((a, b) => {
        if (a.hasChildren === b.hasChildren) {
            return a.name.localeCompare(b.name);
        } else if (a.hasChildren) {
            return -1;
        } else {
            return 1;
        }
    });
}
