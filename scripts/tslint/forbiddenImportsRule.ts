import * as path from "path";
import * as Lint from "tslint";
import { ImportKind, findImports } from "tsutils";
import * as ts from "typescript";

import { forbiddenImports, join, root } from "./helpers";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "Forbidden import from this directory";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk, this.ruleArguments);
    }
}

// The walker takes care of all the work.
function walk(ctx: Lint.WalkContext<string[]>) {
    const imports = findImports(ctx.sourceFile, ImportKind.All);

    for (const name of imports) {
        for (const entry of forbiddenImports) {
            const folder = join(root, entry.root, entry.from);
            if (ctx.sourceFile.fileName.startsWith(folder)) {
                checkForbidenImport(ctx, name, entry.imports);
            }
        }
    }
}

function checkForbidenImport(ctx: Lint.WalkContext<string[]>, name, forbidenImports: string[]) {
    for (const forbidden of forbidenImports) {
        const regex = new RegExp(`^${forbidden.replace(/\*/g, ".*")}$`);
        if (regex.test(name.text)) {
            const message = `${Rule.FAILURE_STRING} "${forbidden}"`;
            ctx.addFailure(name.getStart(ctx.sourceFile) + 1, name.end - 1, message);
            break;
        }
    }
}
