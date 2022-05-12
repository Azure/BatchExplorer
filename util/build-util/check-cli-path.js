const shelljs = require("shelljs");
const color = require("cli-color");

if (!shelljs.which("butil")) {
    console.warn(
        color.red(
            "WARNING: butil not found in path. Run `npm run dev-setup` from " +
                "the root directory to install it."
        )
    );
}
