/* eslint-disable @typescript-eslint/prefer-namespace-keyword */
declare module "*.scss";
declare module "*.css";

// Provided by webpack: emits a literal `require` (bypasses bundling) so runtime
// paths outside the bundle (e.g. the app's own package.json) resolve correctly.
declare const __non_webpack_require__: NodeRequire;

declare module "element-resize-detector" {
    module ElementResizeDetectorMaker {

    }
    function ElementResizeDetectorMaker(options: any): ElementResizeDetector;

    class ElementResizeDetector {
        listenTo(element: HTMLElement, callback: (el: HTMLElement) => void);
        uninstall(element: HTMLElement);
    }
    export = ElementResizeDetectorMaker;
}
