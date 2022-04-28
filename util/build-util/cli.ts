#!/usr/bin/env node

//////////////////////////////
// Cross-platform utilities //
//////////////////////////////

import * as yargs from "yargs";
import {
    batchExplorerHome,
    configure,
    copyFiles,
    gatherBuildResults,
    linkLocalProjects,
    mkdirp,
    moveFiles,
    rmrf,
    unlinkLocalProjects,
} from "./util";

yargs
    .command({
        command: "configure",
        aliases: ["config"],
        describe: "Configure CLI properties",
        handler: () => configure(),
    })
    .command({
        command: "cp <src> <dest>",
        aliases: ["copy"],
        describe: "Copy files from one place to another",
        builder: (yargs: yargs.Argv) =>
            yargs
                .positional("sourcePath", {
                    describe: "The source path",
                    default: "",
                })
                .positional("destPath", {
                    describe: "The destination path",
                    default: "",
                }),
        handler: (argv) => copyFiles(argv.sourcePath, argv.destPath),
    })
    .command({
        command: "mv <src> <dest>",
        aliases: ["move"],
        describe: "Move file from one place to another",
        builder: (yargs: yargs.Argv) =>
            yargs
                .positional("sourcePath", {
                    describe: "The source path",
                    default: "",
                })
                .positional("destPath", {
                    describe: "The destination path",
                    default: "",
                }),
        handler: (argv) => moveFiles(argv.sourcePath, argv.destPath),
    })
    .command({
        command: "mkdirp <directory>",
        describe: "Create a directory (and any required parents)",
        builder: (yargs: yargs.Argv) =>
            yargs.positional("directory", {
                describe: "The directory to create",
                default: "",
            }),
        handler: (argv) => mkdirp(argv.directory),
    })
    .command({
        command: "rmrf <directory>",
        describe: "Remove a directory and all of its contents",
        builder: (yargs: yargs.Argv) =>
            yargs.positional("directory", {
                describe: "The directory to remove",
                default: "",
            }),
        handler: (argv) => rmrf(argv.directory),
    })
    .command({
        command: "gather-build-results <path>",
        describe: "Collects build/test output into a top-level build directory",
        builder: (yargs: yargs.Argv) =>
            yargs.positional("basePath", {
                describe: "The directory from which to gather build results",
                default: batchExplorerHome,
            }),
        handler: (argv) => gatherBuildResults(argv.basePath),
    })
    .command({
        command: "link",
        describe: "Link local projects for local development",
        handler: () => linkLocalProjects(),
    })
    .command({
        command: "unlink",
        describe: "Unlink local projects (and replace with remote)",
        handler: () => unlinkLocalProjects(),
    })
    .help().argv;
