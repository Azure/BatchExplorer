// tslint:disable:no-console
import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import { promisify } from "util";

const root = path.join(__dirname, "../..");

async function listFiles(pattern): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        glob(pattern, (err, files) => {
            if (err) { return reject(err); }
            resolve(files);
        });
    });
}

async function readFile(file) {
    return promisify(fs.readFile)(file);
}

async function fileContains(file, pattern) {
    const buffer = await readFile(file);
    return buffer.toString().indexOf(pattern) !== -1;
}

async function findInvalidFiles(pattern) {
    const files = await listFiles(path.join(root, "/src/@batch-flask/**/*.ts"));
    const fileValid = await Promise.all(files.map(async x => {
        return {
            file: x,
            valid: !(await fileContains(x, pattern)),
        };
    }));
    return fileValid.filter(x => !x.valid).map(x => x.file);
}

async function run() {
    const invalidFiles = await findInvalidFiles(`from "app`);

    if (invalidFiles) {
        const readme = path.join(root, "src/@batch-flask/Readme.md");
        console.log("=".repeat(150));
        console.error("ERROR: There is some files in the @batch-flask package" +
            " which import from outside of the package.");
        console.error(`This needs to be removed. @batch-flask should be self contained. See ${readme}`);

        console.log("-".repeat(150));
        for (const file of invalidFiles) {
            console.log(`@batch-flask package contains imports to the app folder: ${file}`);
        }
        console.log("=".repeat(150));

        // TODO enable when clenup is done
        // process.exit(-1);
    }
}

run().catch((e) => console.error("Error running Bl common guard", e));
