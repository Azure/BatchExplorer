import { List } from "immutable";
import * as path from "path";

import { File } from "app/models";
import { fileToTreeNode, generateDir, prettyFileSize, sortTreeNodes, standardizeFilePath } from "./helper";

export interface FileTreeNodeParams {
    path: string;
    isDirectory: boolean;
    children?: FileTreeNode[];
    loaded?: boolean;
    contentLength?: number;
}

export class FileTreeNode {
    public path: string;
    public isDirectory: boolean;
    public children: FileTreeNode[];
    public loaded: boolean;
    public name: string;

    /**
     * Content length if node is a file
     */
    public contentLength: number;

    constructor(params: FileTreeNodeParams) {
        this.path = params.path;
        this.isDirectory = params.isDirectory;
        this.children = params.children || [];
        this.loaded = params.loaded || false;
        this.contentLength = params.contentLength;

        this.name = this._computeName();
    }

    /**
     * Helper function that helps to append pretty file size after file name
     * @param file
     */
    private _computeName(): string {
        const displayName = this.path.split("\/").last();
        if (this.isDirectory) {
            return displayName;

        } else {
            return `${displayName} (${prettyFileSize(this.contentLength.toString())})`;
        }
    }
}

export class FileTreeStructure {
    public root: FileTreeNode;
    public directories: StringMap<FileTreeNode> = {};

    constructor() {
        this.root = new FileTreeNode({
            path: "",
            isDirectory: true,
        });
        this.directories["."] = this.root;
    }

    public addFiles(files: List<File>) {
        const directories = this.directories;
        for (let file of files.toArray()) {
            const node = fileToTreeNode(file);

            const folder = standardizeFilePath(path.dirname(file.name));
            this._checkDirInTree(folder);

            if (file.isDirectory) {
                if (!directories[standardizeFilePath(file.name)]) {
                    directories[standardizeFilePath(file.name)] = node;
                    directories[folder].children.push(node);
                }
            } else {
                directories[folder].children.push(node);
            }
        }

        for (let dir of Object.keys(directories)) {
            directories[dir].children = sortTreeNodes(directories[dir].children);
        }
    }

    public isPathLoaded(path: string) {
        path = standardizeFilePath(path);
        if (!(path in this.directories)) {
            return false;
        }

        return this.directories[path].loaded;
    }

    private _checkDirInTree(directory: string) {
        console.log("check dir in tree", directory);
        const directories = this.directories;
        if (this.directories[directory]) {
            return;
        }
        directories[directory] = generateDir(directory);

        const segments = directory.split("/");
        const parent = segments.slice(0, -1).join("/");
        console.log("Parent is", parent);
        if (directory !== parent) {
            this._checkDirInTree(parent);
            directories[parent].children.push(directories[directory]);
        }
    }
}
