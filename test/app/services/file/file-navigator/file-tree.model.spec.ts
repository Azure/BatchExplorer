import { List } from "immutable";

import { LoadingStatus } from "app/components/base/loading";
import { File } from "app/models";
import { FileTreeNode, FileTreeStructure } from "app/services/file";

function reprTree(tree: FileTreeStructure) {
    const rows = reprNode(tree.root);
    return "\n" + rows.map(({ indent, node }) => {
        const tab = "  ".repeat(indent);
        const char = node.isDirectory ? "+" : "-";
        return `| ${tab}${char} ${node.name}`;
    }).join("\n") + "\n";
}

function reprNode(node: FileTreeNode, indent = 0) {
    let rows = [];
    for (let [_, child] of node.children) {
        rows.push({ indent, node: child });
        if (child.children.size > 0) {
            for (let row of reprNode(child, indent + 1)) {
                rows.push(row);
            }
        }
    }
    return rows;
}

function makeFile(path: string, contentLength: number = 1024): File {
    return new File({
        name: path,
        isDirectory: false,
        properties: {
            contentLength,
            lastModified: new Date(),
        },
    });
}

function makeDir(path: string): File {
    return new File({
        name: path,
        isDirectory: true,
    });
}

function cleanupRepr(repr: string): string {
    const lines = repr.split("\n").filter(x => !x.isBlank());
    return "\n" + lines.map(x => x.trim()).join("\n") + "\n";
}

fdescribe("FileTreeStructure", () => {
    let tree: FileTreeStructure;

    describe("#addFiles()", () => {
        beforeEach(() => {
            tree = new FileTreeStructure();
        });

        it("should add root files at the root of the tree and sort alpha", () => {
            const files = List([makeFile("stdout.txt"), makeFile("stderr.txt")]);
            tree.addFiles(files);

            expect(reprTree(tree)).toEqual(cleanupRepr(`
            | - stderr.txt
            | - stdout.txt
            `));
        });

        it("should add nested files correctly", () => {
            const files = List([makeDir("wd"), makeFile("wd/stdout.txt"), makeFile("wd/stderr.txt")]);
            tree.addFiles(files);

            expect(reprTree(tree)).toEqual(cleanupRepr(`
            | + wd
            |   - stderr.txt
            |   - stdout.txt
            `));
        });

        it("should add nested files when directory return is after files", () => {
            const files = List([makeFile("wd/stdout.txt"), makeFile("wd/stderr.txt"), makeDir("wd")]);
            tree.addFiles(files);

            expect(reprTree(tree)).toEqual(cleanupRepr(`
            | + wd
            |   - stderr.txt
            |   - stdout.txt
            `));
        });

        it("should add nested files when directory is not returned", () => {
            const files = List([makeFile("wd/stdout.txt"), makeFile("wd/stderr.txt")]);
            tree.addFiles(files);

            expect(reprTree(tree)).toEqual(cleanupRepr(`
            | + wd
            |   - stderr.txt
            |   - stdout.txt
            `));
        });

        it("should add nested files with multiple directories", () => {
            const files = List([
                makeFile("root.txt"),
                makeFile("wd/stdout.txt"),
                makeFile("wd/stderr.txt"),
                makeFile("wd/sub/main.sh"),
                makeFile("data/user.json"),
                makeFile("data/other.json"),
            ]);
            tree.addFiles(files);

            expect(reprTree(tree)).toEqual(cleanupRepr(`
            | + data
            |   - other.json
            |   - user.json
            | + wd
            |   + sub
            |     - main.sh
            |   - stderr.txt
            |   - stdout.txt
            | - root.txt
            `));
        });

        it("should add nested files with windows path", () => {
            const files = List([makeFile("wd\\sub\\stdout.txt"), makeFile("wd\\sub\\stderr.txt")]);
            tree.addFiles(files);

            expect(reprTree(tree)).toEqual(cleanupRepr(`
            | + wd
            |   + sub
            |     - stderr.txt
            |     - stdout.txt
            `));
        });

        it("should add nested files correctly when tree has a basePath", () => {
            tree = new FileTreeStructure("startup/wd");
            const files = List([
                makeFile("startup/wd/stdout.txt"),
                makeFile("startup/wd/stderr.txt"),
                makeFile("startup/wd/sub/main.sh"),
            ]);
            tree.addFiles(files);
            expect(reprTree(tree)).toEqual(cleanupRepr(`
            | + sub
            |   - main.sh
            | - stderr.txt
            | - stdout.txt
            `));
        });
    });

    describe("#getNode()", () => {
        beforeEach(() => {
            tree = new FileTreeStructure();
            const files = List([
                makeFile("root.txt"),
                makeFile("wd/stdout.txt"),
                makeFile("wd/stderr.txt"),
                makeFile("wd/sub/main.sh"),
                makeFile("data/user.json"),
                makeFile("data/other.json"),
            ]);
            tree.addFiles(files);
        });

        it("should return file node if it extist", () => {
            const root = tree.getNode("root.txt");
            expect(root.name).toEqual("root.txt");
            expect(root.path).toEqual("root.txt");
            expect(root.isDirectory).toBe(false);
            expect(root.contentLength).toBe(1024);
            expect(root.loadingStatus).toEqual(LoadingStatus.Ready);

            const sub = tree.getNode("wd/sub/main.sh");
            expect(sub.name).toEqual("main.sh");
            expect(sub.path).toEqual("wd/sub/main.sh");
            expect(sub.isDirectory).toBe(false);
            expect(sub.contentLength).toBe(1024);
            expect(sub.loadingStatus).toEqual(LoadingStatus.Ready);
        });

        it("should return folder node if it exists", () => {
            const sub = tree.getNode("wd/sub");
            expect(sub.name).toEqual("sub");
            expect(sub.path).toEqual("wd/sub");
            expect(sub.isDirectory).toBe(true);
            expect(sub.loadingStatus).toEqual(LoadingStatus.Ready);
        });

        it("should a folder if doesn't exists", () => {
            const sub = tree.getNode("wd/unknown");
            expect(sub.name).toEqual("unknown");
            expect(sub.path).toEqual("wd/unknown");
            expect(sub.isDirectory).toBe(true);
            expect(sub.loadingStatus).toEqual(LoadingStatus.Loading);
        });
    });

    describe("#deleteNode()", () => {
        beforeEach(() => {
            tree = new FileTreeStructure();
            const files = List([
                makeFile("root.txt"),
                makeFile("folder/file1.txt"),
                makeFile("folder/subfolder/file2.txt"),
                makeFile("folder/subfolder/file3.txt"),
                makeFile("folder/subfolder/subsubfolder/file4.txt"),
                makeFile("other/file1.txt"),
                makeFile("other/file2.txt"),
            ]);

            tree.addFiles(files);
        });

        it("check tree layout as expected", () => {
            expect(reprTree(tree)).toEqual(cleanupRepr(`
            | + folder
            |   + subfolder
            |     + subsubfolder
            |       - file4.txt
            |     - file2.txt
            |     - file3.txt
            |   - file1.txt
            | + other
            |   - file1.txt
            |   - file2.txt
            | - root.txt
            `));
        });

        // it("should return folder node if it exists", () => {
        //     const sub = tree.getNode("wd/sub");
        //     expect(sub.name).toEqual("sub");
        //     expect(sub.path).toEqual("wd/sub");
        //     expect(sub.isDirectory).toBe(true);
        //     expect(sub.loadingStatus).toEqual(LoadingStatus.Ready);
        // });

        // it("should a folder if doesn't exists", () => {
        //     const sub = tree.getNode("wd/unknown");
        //     expect(sub.name).toEqual("unknown");
        //     expect(sub.path).toEqual("wd/unknown");
        //     expect(sub.isDirectory).toBe(true);
        //     expect(sub.loadingStatus).toEqual(LoadingStatus.Loading);
        // });
    });
});
