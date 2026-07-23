process.env.NODE_ENV = "production";
// Load the sibling main bundle at runtime (not bundled here) so this stays a tiny
// loader and does not duplicate the whole main graph. Webpack leaves this require
// untouched via __non_webpack_require__.
__non_webpack_require__("./main.js");
