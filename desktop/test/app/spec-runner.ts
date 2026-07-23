/* eslint-disable no-console */
import "./spec-imports";

import { ChangeDetectorRef, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";
import "./spec-reporters";

TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
);

// Angular 22 made OnPush the default change detection strategy. Because these
// tests drive updates by mutating a host component property (or a child's own
// state, e.g. via a ControlValueAccessor) and then calling
// `fixture.detectChanges()` — rather than firing template events — OnPush views
// are never flagged dirty and their bindings are not re-evaluated. Restore the
// pre-v22 behaviour by marking every component view in the fixture for check on
// each `detectChanges()` call (equivalent to the Default strategy used by the
// production AOT build).
function markComponentTreeForCheck(debugElement: DebugElement | null): void {
    if (!debugElement) { return; }
    if (debugElement.componentInstance) {
        try {
            debugElement.injector.get(ChangeDetectorRef).markForCheck();
        } catch {
            // Some debug nodes may not expose a ChangeDetectorRef; ignore.
        }
    }
    for (const child of debugElement.children) {
        markComponentTreeForCheck(child);
    }
}

const originalDetectChanges = ComponentFixture.prototype.detectChanges;
ComponentFixture.prototype.detectChanges = function detectChanges(
    this: ComponentFixture<unknown>,
    checkNoChanges = true,
) {
    try {
        markComponentTreeForCheck(this.debugElement);
    } catch {
        // Defensive: never let the compatibility shim break detectChanges.
    }
    return originalDetectChanges.call(this, checkNoChanges);
};

// Angular 22 changed `DebugElement.classes` to report only the classes actually
// present on the element (all `true`). Classes bound via `@HostBinding("class.x")`
// or `[class.x]` that evaluate to false are no longer included, so `classes["x"]`
// returns `undefined` instead of `false`. Many specs assert
// `expect(de.classes["x"]).toBe(false)`, so restore the pre-v22 semantics by
// defaulting missing entries to `false`.
const classesDescriptor = Object.getOwnPropertyDescriptor(DebugElement.prototype, "classes");
if (classesDescriptor && classesDescriptor.get) {
    const originalClassesGet = classesDescriptor.get;
    Object.defineProperty(DebugElement.prototype, "classes", {
        configurable: true,
        enumerable: classesDescriptor.enumerable,
        get(this: DebugElement) {
            const classes = originalClassesGet.call(this) as { [key: string]: boolean };
            return new Proxy(classes, {
                get: (target, prop) =>
                    typeof prop === "string" && !(prop in target) ? false : (target as Record<string, boolean>)[prop as string],
            });
        },
    });
}

declare global {
    interface NodeRequire {
        context: any;
    }
}

/*
 * Ok, this is kinda crazy. We can use the context method on
 * require that webpack created in order to tell webpack
 * what files we actually want to require or import.
 * Below, context will be a function/object with file names as keys.
 * Using that regex we are saying look in ../src then find
 * any file that ends with spec.ts and get its path. By passing in true
 * we say do this recursivelyf
 */
const testContext = require.context(".", true, /\.spec\.ts/);
const testAppContext = require.context("../../src/app", true, /\.spec\.ts/);
const testCommonContext = require.context("../../src/common", true, /\.spec\.ts/);
// Exclude the @batch-flask/compiler folder
const testBlCommonContext = require.context("../../src/@batch-flask", true,
    /^\.\/(?!compiler)(?!.*node\.spec\.ts).*\.spec\.ts$/);

/*
 * get all the files, for each file, call the context function
 * that will require the file and load it up here. Context will
 * loop and require those spec files here
 */
function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

// requires and returns all modules that match
const modules = [
    ...requireAll(testContext),
    ...requireAll(testAppContext),
    ...requireAll(testCommonContext),
    ...requireAll(testBlCommonContext),
];
console.log(`Running specs from ${modules.length} files`);

import "./spec-controls";
