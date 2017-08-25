import { List } from "immutable";
import * as path from "path";

import { LoadingStatus } from "app/components/base/loading";
import { File } from "app/models";
import { fileToTreeNode, generateDir, prettyFileSize, sortTreeNodes, standardizeFilePath } from "./helper";

export interface FileTreeNodeParams {
    path: string;
    isDirectory: boolean;
    children?: FileTreeNode[];
    loadingStatus?: LoadingStatus;
    contentLength?: number;
    lastModified?: Date;
}

export class FileTreeNode {
    public path: string;
    public isDirectory: boolean;
    public children: FileTreeNode[];
    public loadingStatus: LoadingStatus;
    public name: string;

    /**
     * Content length if node is a file
     */
    public contentLength: number;
    public lastModified: Date;

    constructor(params: FileTreeNodeParams) {
        this.path = params.path;
        this.isDirectory = params.isDirectory;
        this.children = params.children || [];
        this.loadingStatus = params.loadingStatus || (this.isDirectory ? LoadingStatus.Loading : LoadingStatus.Ready);
        this.contentLength = params.contentLength;
        this.lastModified = params.lastModified;

        this.name = this._computeName();
    }

    public markAsLoaded() {
        this.loadingStatus = LoadingStatus.Ready;
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

    public getNode(nodePath: string) {
        nodePath = standardizeFilePath(nodePath);
        if (nodePath === "") { nodePath = "."; }
        if (nodePath in this.directories) {
            return this.directories[nodePath];
        } else {
            const parent = path.dirname(nodePath);
            if (parent in this.directories) {
                const matchingChild = this.directories[parent].children.filter(x => x.path === nodePath).first();
                if (matchingChild) {
                    return matchingChild;
                }
            }
            return new FileTreeNode({
                path: nodePath,
                loadingStatus: LoadingStatus.Loading,
                isDirectory: true,
            });
        }
    }

    public isPathLoaded(path: string) {
        path = standardizeFilePath(path);
        if (!(path in this.directories)) {
            return false;
        }

        return this.directories[path].loadingStatus === LoadingStatus.Ready;
    }

    private _checkDirInTree(directory: string) {
        const directories = this.directories;
        if (this.directories[directory]) {
            this.directories[directory].loadingStatus = LoadingStatus.Ready;
            return;
        }
        directories[directory] = generateDir(directory);

        const segments = directory.split("/");
        let parent = segments.slice(0, -1).join("/");
        if (parent === "") { parent = "."; }

        if (directory !== parent) {
            this._checkDirInTree(parent);
            directories[parent].children.push(directories[directory]);
        }
    }
}
