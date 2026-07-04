// Polyfills
import "reflect-metadata";

// eslint-disable-next-line
require("zone.js");

// Load the Angular JIT compiler here, in the polyfills entry. The renderer
// bootstraps with platformBrowserDynamic() (JIT), and Angular's partially-compiled
// library injectables (e.g. PlatformLocation from @angular/common) run
// `getCompilerFacade()` in their static initializers at module-evaluation time, so
// the compiler MUST be registered before any @angular/* app code evaluates. The
// AOT loader (@ngtools/webpack) reorders/strips a bare `import "@angular/compiler"`
// inside app.ts, and polyfills is emitted as a separate chunk that loads before
// app.js, so registering it here guarantees correct ordering. `require` (not import)
// is used so it is never reordered or tree-shaken.
// eslint-disable-next-line
require("@angular/compiler");
