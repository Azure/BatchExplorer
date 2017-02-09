const electron = require("electron");
const childProcess = require("child_process");
const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const merge = require("merge2");
const path = require("path");

// copy images to build directory
const imagesDir = ["./app/assets/images/**/*"];
gulp.task("copy-images", function () {
    return gulp.src(imagesDir)
        .pipe(gulp.dest("build/assets/images"));
});

// Build the node typescript running in node
// The browser typescript is handled with webpack
const root = "./";
const tsRoot = path.join(root, "client");
const mapRoot = path.join(root, "build", "client");
const sourceFiles = ["./client/**/*.ts"];

gulp.task("build-node-ts", ["copy-images"], function () {
    var tsResult = gulp.src(sourceFiles)
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest("build/definitions")),
        tsResult.js.pipe(sourcemaps.write("./", {
            includeContent: false,
            sourceRoot: function (file) {
                return "../client";
            },
        })).pipe(gulp.dest("build/client")),
    ]);
});

// create the main run task
gulp.task("run", function () {
    childProcess.spawn(electron, ["--debug=5858", "./build/client/main.js"], { stdio: "inherit" });
});
