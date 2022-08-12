#!/usr/bin/env node

//////////////////////////////
// Cross-platform utilities //
//////////////////////////////

import * as path from "path";
import * as yargs from "yargs";
import {
    bumpVersion,
    chmodx,
    configure,
    copyFiles,
    gatherBuildResults,
    linkLocalProjects,
    mkdirp,
    moveFiles,
    rmrf,
    unlinkLocalProjects,
    ReleaseType,
    VersionReleaseTypes,
    defaultPrereleaseTag,
    publishPackages,
} from "./util";

yargs
    .command({
        command: "configure",
        aliases: ["config"],
        describe:
            "Configure CLI properties. If at least one configuration option " +
            "is specified, the configuration file is set or updated, without " +
            "a prompt",
        builder: (yargs: yargs.Argv) =>
            yargs
                .option("paths.batchExplorer", {
                    type: "string",
                    describe: "The path to Batch Explorer/Shared Libraries",
                })
                .option("paths.batchPortalExtension", {
                    type: "string",
                    describe: "The path to the Batch portal extension",
                })
                .option("print", {
                    type: "boolean",
                    describe: "Print the resultant configuration object",
                    default: false,
                }),
        handler: (argv) => configure(argv),
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
        command: "gather-build-results [basePath]",
        describe: "Collects build/test output into a top-level build directory",
        builder: (yargs: yargs.Argv) =>
            yargs.positional("basePath", {
                describe: "The directory from which to gather build results",
                default: "",
            }),
        handler: (argv) => gatherBuildResults(path.resolve(argv.basePath)),
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
    .command({
        command: "chmodx [path..]",
        describe: "Make a file executable",
        builder: (yargs: yargs.Argv) =>
            yargs.positional("path", {
                describe: "File or files to make executable",
            }),
        handler: (argv) => chmodx(argv.path),
    })
    .command({
        command: "bump <type>",
        describe: "Increment the version of all packages",
        builder: (yargs: yargs.Argv) =>
            yargs
                .positional("type", {
                    describe: "The version type to increment",
                    type: "string",
                    choices: Object.keys(VersionReleaseTypes),
                })
                .option("tag", {
                    describe: "Tag for prereleases",
                    default: defaultPrereleaseTag,
                    type: "string",
                }),
        handler: (argv) => bumpVersion(argv.type as ReleaseType, argv.tag),
    })
    .command({
        command: "publish",
        describe: "Publish public packages to the registry",
        builder: (yargs: yargs.Argv) =>
            yargs
                .option("tag", {
                    describe: "Which distribution tag to apply",
                    type: "string",
                })
                .option("confirm", {
                    describe: "Confirm details before publishing?",
                    default: true,
                })
                .option("npmconfig", {
                    describe: "Custom NPM user configuration file (.npmrc)",
                    type: "string",
                }),
        handler: (argv) => publishPackages(argv),
    })
    .help().argv;
