// tslint:disable:no-console
import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import { promisify } from "util";

const forbiddenImports = [
    {
        root: "src",
        from: "@batch-flask",
        imports: [
            "app/*",
            "common",
            "common/*",
            "client/*",
        ],
    },
];

function join(...paths) {
    return path.join(...paths).replace(/\\/g, "/");
}

async function listFiles(pattern): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        glob(pattern, (err, files) => {
            if (err) { return reject(err); }
            resolve(files);
        });
    });
}

async function readFile(file) {
    return promisify(fs.readFile)(file).then(x => x.toString());

}

function fileContains(content, imports) {
    const invalidImports = [];

    for (const imp of imports) {
        const regex = new RegExp(`from "${imp.replace(/\*/g, ".*")}"`);
        if (regex.test(content)) {
            invalidImports.push(imp);
        }
    }
    return invalidImports;
}

function findBase(file: string) {
    for (const entry of forbiddenImports) {
        const folder = join(root, entry.root);
        if (file.startsWith(folder)) {
            return folder;
        }
    }
    return null;
}

function findParentImports(file: string, content: string) {
    const base = findBase(file);
    if (!base || file.endsWith("spec.ts")) { return []; }
    const segments = path.relative(base, file).replace(/\\/g, "/").split("/");
    const imps = [];
    const cur = [];

    for (const segment of segments.slice(0, -1)) {
        cur.push(segment);
        const imp = cur.join("/");
        if (content.indexOf(`from "${imp}"`) !== -1) {
            console.log("Banned import", imp);
            return imps.push(imp);
        }
    }
    return imps;
}

async function findInvalidImports(file: string) {
    const content = await readFile(file);
    let invalidImports = [];
    for (const entry of forbiddenImports) {
        const folder = join(root, entry.root, entry.from);
        if (file.startsWith(folder)) {
            const imp = fileContains(content, entry.imports);
            if (imp) {
                invalidImports = invalidImports.concat(imp);
            }
        }
    }

    return invalidImports.concat(findParentImports(file, content));
}

async function findInvalidFiles(pattern) {
    const files = await listFiles(path.join(root, "src/@batch-flask/**/*.ts"));
    const fileValid = await Promise.all(files.map(async x => {
        return {
            file: x,
            invalidImports: await findInvalidImports(x),
        };
    }));
    return fileValid.filter(x => Boolean(x.invalidImports));
}

async function run() {
    const invalidFiles = await findInvalidFiles(`from "app`);

    if (invalidFiles.length > 0) {
        const readme = path.join(root, "src/@batch-flask/Readme.md");
        console.log("=".repeat(150));
        console.error("ERROR: There is some files in the @batch-flask package" +
            " which import from outside of the package.");
        console.error(`This needs to be removed. @batch-flask should be self contained. See ${readme}`);

        console.log("-".repeat(150));
        for (const { file, invalidImports } of invalidFiles) {
            for (const invalidImport of invalidImports) {
                console.log(`${file}: File contains reference to forbiden import "${invalidImport}"`);
            }
        }
        console.log("=".repeat(150));

        process.exit(-1);
    } else {
        console.log("@batch-flask package imports look good.");
    }
}

run().catch((e) => console.error("Error running Bl common guard", e));
