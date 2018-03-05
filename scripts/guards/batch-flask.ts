// tslint:disable:no-console
import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import { promisify } from "util";

const root = path.join(__dirname, "../..");

const forbiddenImports = [
    {
        from: "",
        imports: [
            "app/*",
            "common",
            "common/*",
            "client/*",
        ],
    },
];

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

async function fileContains(content, imports) {
    for (const imp of imports) {
        const regex = new RegExp(`from "${imp.replace(/\*/g, ".*")}"`);
        if (regex.test(content)) {
            return imp;
        }
    }
    return null;
}

async function findInvalidImports(file: string) {
    const content = await readFile(file);
    for (const { from, imports } of forbiddenImports) {
        if (!from || file.startsWith(from)) {
            const imp = await fileContains(content, imports);
            if (imp) {
                console.log("Contain this import", imp);
                return imp;
            }
        }
    }
    return null;
}

async function findInvalidFiles(pattern) {
    const files = await listFiles(path.join(root, "/src/@batch-flask/**/*.ts"));
    const fileValid = await Promise.all(files.map(async x => {
        return {
            file: x,
            invalidImport: await findInvalidImports(x),
        };
    }));
    return fileValid.filter(x => Boolean(x.invalidImport));
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
        for (const {file, invalidImport} of invalidFiles) {
            console.log(`${file}: File contains reference to forbiden import "${invalidImport}"`);
        }
        console.log("=".repeat(150));

        process.exit(-1);
    } else {
        console.log("@batch-flask package imports look good.");
    }
}

run().catch((e) => console.error("Error running Bl common guard", e));
