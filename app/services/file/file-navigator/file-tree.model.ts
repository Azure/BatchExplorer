import { List } from "immutable";

import { LoadingStatus } from "@batch-flask/ui/loading/loading-status";
import { File } from "app/models";
import { CloudPathUtils } from "app/utils";
import { fileToTreeNode, generateDir, sortTreeNodes } from "./helper";

export interface FileTreeNodeParams {
    path: string;
    isDirectory: boolean;
    children?: Map<string, FileTreeNode>;
    loadingStatus?: LoadingStatus;
    contentLength?: number;
    lastModified?: Date;
    isUnknown?: boolean;
    virtual?: boolean;
}

export class FileTreeNode {
    public path: string;
    public isDirectory: boolean;
    public children: Map<string, FileTreeNode>;
    public loadingStatus: LoadingStatus;
    public name: string;
    public isUnknown: boolean;

    /**
     * Content length if node is a file
     */
    public contentLength: number;
    public lastModified: Date;
    public virtual: boolean;

    constructor(params: FileTreeNodeParams) {
        this.path = params.path;
        this.isDirectory = params.isDirectory;
        this.children = params.children || new Map();
        this.loadingStatus = params.loadingStatus || (this.isDirectory ? LoadingStatus.Loading : LoadingStatus.Ready);
        this.contentLength = params.contentLength;
        this.lastModified = params.lastModified;
        this.isUnknown = params.isUnknown || false;
        this.name = this._computeName();
        this.virtual = params.virtual || false;
    }

    public clone() {
        return new FileTreeNode(this);
    }

    public walk() {
        return this.children.values();
    }

    public markAsLoaded() {
        this.loadingStatus = LoadingStatus.Ready;
    }

    /**
     * Helper function that helps to append pretty file size after file name
     * @param file
     */
    private _computeName(): string {
        return this.path.split("\/").last();
    }
}

export class FileTreeStructure {
    public root: FileTreeNode;
    public directories: StringMap<FileTreeNode> = {};
    public readonly basePath: string;

    constructor(basePath: string = "") {
        this.basePath = CloudPathUtils.asBaseDirectory(basePath);
        this.root = new FileTreeNode({
            path: "",
            isDirectory: true,
        });
        this.directories[""] = this.root;
    }

    public addFiles(files: List<File>) {
        const directories = this.directories;
        for (const file of files.toArray()) {
            const node = fileToTreeNode(file, this.basePath);

            const folder = CloudPathUtils.dirname(node.path);
            this._checkDirInTree(folder);

            if (file.isDirectory) {
                if (!directories[node.path]) {
                    directories[node.path] = node;
                    directories[folder].children.set(node.path, node);
                }
            } else {
                directories[folder].children.set(node.path, node);
            }
        }

        for (const dir of Object.keys(directories)) {
            directories[dir].children = sortTreeNodes(directories[dir].children);
        }
    }

    public getNode(nodePath: string) {
        nodePath = CloudPathUtils.normalize(nodePath);
        if (nodePath in this.directories) {
            return this.directories[nodePath];
        } else {
            const parent = CloudPathUtils.dirname(nodePath);
            if (parent in this.directories) {
                const matchingChild = this.directories[parent].children.get(nodePath);
                if (matchingChild) {
                    return matchingChild;
                }
            }

            return new FileTreeNode({
                path: nodePath,
                loadingStatus: LoadingStatus.Loading,
                isDirectory: true,
                isUnknown: true,
            });
        }
    }

    /**
     * Delete a node from the tree and it's corresponding folder should that folder be empty
     * after the file was deleted.
     */
    public deleteNode(nodePath: string) {
        const node = this.getNode(nodePath);
        if (node.isDirectory) {
            delete this.directories[node.path];
        }

        const parentPath = CloudPathUtils.dirname(nodePath);
        const parent = this.directories[parentPath];
        if (parent && parent.children.has(nodePath)) {
            // delete the file from the parent directory and then process the parent folder.
            parent.children.delete(nodePath);
            if (parent.children.size === 0) {
                return this.deleteNode(parentPath);
            }
        }
    }

    public isPathLoaded(path: string) {
        path = CloudPathUtils.normalize(path);
        if (!(path in this.directories)) {
            return false;
        }

        return this.directories[path].loadingStatus === LoadingStatus.Ready;
    }

    public getParent(node: FileTreeNode) {
        const parentPath = CloudPathUtils.dirname(node.path);
        return this.directories[parentPath];
    }

    public addVirtualFolder(path: string) {
        this._checkDirInTree(path, true);
    }

    /**
     *
     * @param directory Ensure the given directory exist in the path
     * @param virtual If the dictory doesn't exists it will be flagged as virtual if this is true.
     *                If this is false and the directory exisist but is virtual it will be changed to non virtual
     */
    private _checkDirInTree(directory: string, virtual = false) {
        const directories = this.directories;
        if (this.directories[directory]) {
            this.directories[directory].loadingStatus = LoadingStatus.Ready;
            if (!virtual && this.directories[directory].virtual) {
                this.directories[directory].virtual = false;
            } else {
                return;
            }
        } else {
            directories[directory] = generateDir(directory, virtual);
        }

        const parent = CloudPathUtils.dirname(directory);

        if (directory !== parent) {
            this._checkDirInTree(parent, virtual);
            directories[parent].children.set(directory, directories[directory]);
        }
    }
}
