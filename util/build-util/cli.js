#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

//////////////////////////////
// Cross-platform utilities //
//////////////////////////////

const fs = require("fs");
const path = require("path");
const shell = require("shelljs");

// Tasks should return an exit status of 0 for success, > 0 for failure.
// They may also return a promise which resolves to an exit status.
const TASKS = {
    /////////////////////
    // SHELL UTILITIES //
    /////////////////////

    // Copy command (cp)
    cp: (sourcePath, destPath) => {
        if (!sourcePath) {
            console.error("Failed to copy: No source path specified");
            return 1;
        }
        if (!destPath) {
            console.error("Failed to copy: No dest path specified");
            return 1;
        }

        shell.cp(sourcePath, destPath);

        return 0;
    },

    // Recursive make directory (mkdir -p)
    mkdirp: (targetPath) => {
        if (!targetPath) {
            console.error("Failed to make directory: No path specified");
            return 1;
        }
        targetPath = path.resolve(targetPath);

        fs.mkdirSync(targetPath, { recursive: true });

        return 0;
    },

    // Move command (mv)
    mv: (sourcePath, destPath) => {
        if (!sourcePath) {
            console.error("Failed to move: No source path specified");
            return 1;
        }
        if (!destPath) {
            console.error("Failed to move: No dest path specified");
            return 1;
        }

        shell.mv(sourcePath, destPath);

        return 0;
    },

    // Recursive delete (rm -rf)
    rmrf: (targetPath) => {
        if (!targetPath) {
            console.error("Failed to delete: No path specified");
            return 1;
        }
        fs.rmSync(path.resolve(targetPath), {
            recursive: true,
            force: true,
        });

        return 0;
    },

    /////////////////////
    // GENERAL SCRIPTS //
    /////////////////////

    // Collects build/test output into a top-level "build" directory so CI
    // integrations have one place to look for things like coverage reports
    "gather-build-results": (basePath) => {
        const baseBuildDir = path.join(basePath, "build");

        const doCopy = (src, dst) => {
            console.log(`Copying build/test results from ${src}/* to ${dst}`);
            if (!fs.existsSync(src)) {
                console.warn(`${src} does not exist - skipping`);
                return;
            }
            fs.mkdirSync(dst, { recursive: true });
            shell.cp("-r", src + "/*", dst);
        };

        // packages
        doCopy(
            path.join(basePath, "packages", "common", "build"),
            path.join(baseBuildDir, "common")
        );
        doCopy(
            path.join(basePath, "packages", "react", "build"),
            path.join(baseBuildDir, "react")
        );

        // web
        doCopy(
            path.join(basePath, "web", "build"),
            path.join(baseBuildDir, "web")
        );

        // desktop
        doCopy(
            path.join(basePath, "desktop", "coverage"),
            path.join(baseBuildDir, "desktop", "coverage")
        );

        return 0;
    },
};

/**
 * Takes a task name and a variable number of arguments and passes it to a
 * task function. Exits the process with a status code of 0 for success, or
 * non-zero for failure.
 */
function runTask(args) {
    if (!args) {
        args = [];
    }

    const taskName = args.shift();
    if (!taskName) {
        console.error(
            "\nPlease specify a task from the following list:\n\n\t" +
                Object.getOwnPropertyNames(TASKS).join("\n\t") +
                "\n"
        );
    } else {
        var cmd = TASKS[taskName];
        if (cmd == null) {
            console.log("Unknown task: " + taskName);
            process.exit(1);
        } else {
            let returnValue = cmd(...args);

            // Tasks can return an exit code or a promise that resolves to an
            // exit code.
            if (typeof returnValue === "number") {
                process.exit(returnValue);
            } else if (returnValue && returnValue.then) {
                returnValue.then((exitCode) => {
                    process.exit(exitCode);
                });
            } else {
                throw new Error(
                    "Task did not return an exit code or a promise"
                );
            }
        }
    }
}

// Run the task given on the command line
const taskArgs = process.argv;
taskArgs.shift();
taskArgs.shift();
runTask(taskArgs);
