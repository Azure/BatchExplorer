import { List } from "immutable";
import * as path from "path";

import { LoadingStatus } from "app/components/base/loading";
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

    constructor(params: FileTreeNodeParams) {
        this.path = params.path;
        this.isDirectory = params.isDirectory;
        this.children = params.children || new Map();
        this.loadingStatus = params.loadingStatus || (this.isDirectory ? LoadingStatus.Loading : LoadingStatus.Ready);
        this.contentLength = params.contentLength;
        this.lastModified = params.lastModified;
        this.isUnknown = params.isUnknown || false;
        this.name = this._computeName();
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
        this.directories["."] = this.root;
    }

    public addFiles(files: List<File>) {
        const directories = this.directories;
        for (let file of files.toArray()) {
            const node = fileToTreeNode(file, this.basePath);

            const folder = CloudPathUtils.dirname(node.path) || ".";
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

        for (let dir of Object.keys(directories)) {
            directories[dir].children = sortTreeNodes(directories[dir].children);
        }
    }

    public getNode(nodePath: string) {
        nodePath = this._normalizeNodePath(nodePath);
        if (nodePath in this.directories) {
            return this.directories[nodePath];
        } else {
            const parent = path.dirname(nodePath);
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
        if (!node.isDirectory) {
            // it's a file
            const parent = path.dirname(nodePath);
            if (parent in this.directories && this.directories[parent].children.has(nodePath)) {
                // delete the file from the parent directory and then process the parent folder.
                this.directories[parent].children.delete(nodePath);
                return this.deleteNode(parent);
            }
        } else {
            // it's a directory
            if (node.children.size > 0) {
                return;
            }

            const pathParts = this._splitIntoParts(node.path);
            /**
             * foreach path part, check that the preceeding parts exist until we find
             * the folder that we want to delete.
             *
             * Given these FileTreeNode paths in this.directories:
             * "D:/NCJ/small/task2"
             * "D:/NCJ/small"
             * "D:/NCJ"
             * "D:"
             * "."
             *
             * After deleting the only file from the folder: "D:/NCJ/small/task2", we then need to
             * delete the "D:/NCJ/small/task2" entry from this.directories. Then we need to check
             * "D:/NCJ/small", "D:/NCJ", "D:", "."
             * If we are checking: "D:/NCJ", then we need to check it's children for "D:/NCJ/small"
             * and then it's children for "D:/NCJ/small/task2", when we find this one we can remove it
             * if it has no remaining children.
             */
            // TODO: attempt to clean this up and little
            for (let i = 0; i < pathParts.length; i++) {
                if (pathParts[i] in this.directories) {
                    const directory = this.directories[pathParts[i]];
                    if (directory.children.size === 0) {
                        delete this.directories[pathParts[i]];
                    } else {
                        // hold onto the last parent in order to delete the child from it
                        let parentNode = this.directories[pathParts[i]];
                        let lastParent = parentNode;

                        for (let j = i - 1; j >= 0; j--) {
                            parentNode = parentNode.children.get(pathParts[j]);
                            if (parentNode) {
                                if (parentNode.children.size === 0) {
                                    // found the folder and its empty so delete it.
                                    lastParent.children.delete(pathParts[j]);
                                } else if (parentNode.children.has(pathParts[j])) {
                                    // it's not empty so make this the last parent
                                    lastParent = parentNode.children.get(pathParts[j]);
                                }
                            } else {
                                // break out of the loop as we have no more children
                                break;
                            }
                        }
                    }
                }
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
        const parentPath = path.dirname(node.path);
        return this.directories[parentPath];
    }

    /**
     * Takes a node path and returns an aggregation of it's parts.
     * nodePath => "D:/NCJ/small/task2", results in the following.
     * "D:/NCJ/small/task2"
     * "D:/NCJ/small"
     * "D:/NCJ"
     * "D:"
     * "."
     * Every one of these parts will exist in the tree and contain the initial node path as
     * one of its children which needs to be deleted.
     */
    public _splitIntoParts(nodePath: string) {
        let aggregated: string[] = [];
        const parts = nodePath.split("/");
        for (let i = parts.length - 1; i >= 0; i--) {
            let partPath = null;
            for (let j = 0; j <= i; j++) {
                partPath = partPath ? `${partPath}/${parts[j]}` : parts[j];
            }

            aggregated.push(partPath);
        }

        aggregated.push(".");
        return aggregated;
    }

    private _normalizeNodePath(nodePath: string) {
        nodePath = CloudPathUtils.normalize(nodePath);
        if (nodePath === "") { nodePath = "."; }

        return nodePath;
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
            directories[parent].children.set(directory, directories[directory]);
        }
    }
}
