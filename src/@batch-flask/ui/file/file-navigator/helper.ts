import { File } from "@batch-flask/ui/file/file.model";
import { LoadingStatus } from "@batch-flask/ui/loading/loading-status";
import { CloudPathUtils, StringUtils, prettyBytes } from "@batch-flask/utils";
import { List } from "immutable";
import * as path from "path";
import { FileTreeNode } from "./file-tree.model";

/**
 * Helper function that map File to tree nodes. It will build the nested data structure
 */
export function mapFilesToTree(files: List<File>, baseFolder: string = ""): FileTreeNode[] {
    const directories = {};

    for (const file of files.toArray()) {
        const node = fileToTreeNode(file);
        const folder = path.dirname(file.name);
        const relativePath = CloudPathUtils.normalize(path.relative(baseFolder, folder));

        checkDirInTree(directories, relativePath);

        if (file.isDirectory) {
            if (!directories[CloudPathUtils.normalize(file.name)]) {
                directories[CloudPathUtils.normalize(file.name)] = node;
                directories[relativePath].children.push(node);
            }
        } else {
            directories[relativePath].children.push(node);
        }
    }

    for (const dir of Object.keys(directories)) {
        directories[dir].children = sortTreeNodes(directories[dir].children);
    }
    const root = directories[""];
    return root ? root.children : [];
}

/**
 * Helper function that prettify file size
 * @param size raw file size
 */
export function prettyFileSize(size: string): string {
    // having falsy issues with contentLength = 0
    return prettyBytes(parseInt(size || "0", 10));
}

export function fileToTreeNode(file: File, basePath: string = ""): FileTreeNode {
    const fullPath = CloudPathUtils.normalize(file.name);
    const relativePath = StringUtils.removePrefix(fullPath, basePath);
    console.log("Original path", file.name);
    return new FileTreeNode({
        path: relativePath,
        originalPath: file.name,
        isDirectory: file.isDirectory,
        loadingStatus: LoadingStatus.Ready,
        contentLength: !file.isDirectory && file.properties.contentLength,
        lastModified: file.properties && file.properties.lastModified,
    });
}

export function sortTreeNodes(nodes: Map<string, FileTreeNode>): Map<string, FileTreeNode> {
    return new Map([...nodes.entries()].sort(([aPath, a], [bPath, b]) => {
        if (a.isDirectory === b.isDirectory) {
            return a.name.localeCompare(b.name);
        } else if (a.isDirectory) {
            return -1;
        } else {
            return 1;
        }
    }));
}

function checkDirInTree(directories: StringMap<FileTreeNode>, directory: string) {
    if (directories[directory]) {
        return;
    }
    directories[directory] = generateDir(directory);

    const segments = directory.split("/");
    const parent = segments.slice(0, -1).join("/");
    if (directory !== parent) {
        checkDirInTree(directories, parent);
        directories[parent].children.set(directory, directories[directory]);
    }
}

export function generateDir(dirname, virtual = false): FileTreeNode {
    return new FileTreeNode({
        path: dirname,
        isDirectory: true,
        loadingStatus: LoadingStatus.Ready,
        virtual,
    });
}
