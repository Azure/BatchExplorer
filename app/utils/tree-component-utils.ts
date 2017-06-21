import { File } from "app/models";
import { TreeComponentItem } from "app/models/tree-component-item";
import { prettyBytes } from "app/utils";

export class TreeComponentUtils {
    public static unflattenFileDirectory(files: File[]): TreeComponentItem[] {
        if (!files || files.length === 0) {
            return null;
        }
        let treeNodes: TreeComponentItem[] = [];
        let id: number = 1;
        files.map((item) => {
            const tokens: string[] = item.name.split("\\");
            let parentNode: TreeComponentItem = null;
            tokens.map((token, index) => {
                // if path only contains single element or path token is last one (must be a leaf)
                if (tokens.length === 1 || index === tokens.length - 1) {
                    let newFileNode = <TreeComponentItem>{
                        id: id,
                        fileName: item.name,
                        name: `${token} (${prettyBytes(parseInt(item.properties.contentLength.toString(), 10))})`,
                    };
                    parentNode.children.push(newFileNode);
                } else {
                    // special case for the first element
                    console.log(parentNode);
                    let origin = (index === 0) ?  treeNodes : parentNode.children;
                    let foundNode = origin.filter((node) => node.name === token).first();
                    if (!foundNode) {
                        let newDirNode = <TreeComponentItem>{
                            id: id,
                            name: token,
                            children: [] as TreeComponentItem[],
                        };
                        origin.push(newDirNode);
                        parentNode = newDirNode;
                    } else {
                        parentNode = foundNode;
                    }
                }
                id++;
            });
        });
        return treeNodes;
    }
}
