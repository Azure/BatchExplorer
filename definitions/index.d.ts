// tslint:disable
declare module "azure-batch" {
    export const SharedKeyCredentials: any;
    export const ServiceClient: any;
}

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

// https://craig.is/killing/mice
declare module "mousetrap" {
    function bind(key: string, callback: Function);
    function unbind(key: string, callback: Function);
    function trigger(key: string);
    function reset();
}

declare type Environment = "production" | "development" | "test";

// Gloval variables set by webpack
declare const ENV: Environment;


type StringMap<V> = { [key: string]: V };
