/* eslint-disable @typescript-eslint/prefer-namespace-keyword */
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
