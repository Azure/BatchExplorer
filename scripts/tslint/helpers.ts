import * as path from "path";

export const root = path.join(__dirname, "../..");

export function join(...paths) {
    return path.join(...paths).replace(/\\/g, "/");
}

// TODO: enable more
export const forbiddenImports = [
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
