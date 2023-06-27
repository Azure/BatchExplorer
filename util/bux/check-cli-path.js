/* eslint-disable @typescript-eslint/no-var-requires */
const shelljs = require("shelljs");
const color = require("cli-color");

if (!shelljs.which("bux")) {
    console.warn(
        color.red(
            "WARNING: bux not found in path. Run `npm run dev-setup` from " +
                "the root directory to install it."
        )
    );
}
