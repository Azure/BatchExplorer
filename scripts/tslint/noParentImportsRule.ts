import * as path from "path";
import * as Lint from "tslint";
import { ImportKind, findImports } from "tsutils";
import * as ts from "typescript";

import { forbiddenImports, join, root } from "./helpers";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "Forbidden to import parent(This can create cirular dependencies)";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk, this.ruleArguments);
    }
}

// The walker takes care of all the work.
function walk(ctx: Lint.WalkContext<string[]>) {
    const file = ctx.sourceFile.fileName;
    const base = findBase(file);
    if (!base || file.endsWith("spec.ts")) { return []; }

    const imports = findImports(ctx.sourceFile, ImportKind.All);
    const segments = path.relative(base, file).replace(/\\/g, "/").split("/");
    const cur = [];
    const forbidenImports = new Set();

    for (const segment of segments.slice(0, -1)) {
        cur.push(segment);
        forbidenImports.add(cur.join("/"));
    }

    for (const name of imports) {
        if (forbidenImports.has(name.text)) {
            const message = `${Rule.FAILURE_STRING} "${name.text}"`;
            ctx.addFailure(name.getStart(ctx.sourceFile) + 1, name.end - 1, message);
        }
    }
}

// function checkForbidenImport(ctx: Lint.WalkContext<string[]>, name, forbidenImports: string[]) {
//     for (const forbidden of forbidenImports) {
//         const regex = new RegExp(`^${forbidden.replace(/\*/g, ".*")}$`);
//         if (regex.test(name.text)) {
//             const message = `${Rule.FAILURE_STRING} "${forbidden}"`;
//             ctx.addFailure(name.getStart(ctx.sourceFile) + 1, name.end - 1, message);
//             break;
//         }
//     }
// }

function findBase(file: string) {
    for (const entry of forbiddenImports) {
        const folder = join(root, entry.root);
        if (file.startsWith(folder)) {
            return folder;
        }
    }
    return null;
}
