import { DebugElement } from "@angular/core";
import { MouseButton } from "@batch-flask/core";

export class FakeMouseEvent {
    public stopImmediatePropagation: jasmine.Spy;
    public stopPropagation: jasmine.Spy;
    public preventDefault: jasmine.Spy;
    public shiftKey = false;
    public ctrlKey = false;
    public button: number;

    constructor(attrs: any) {
        this.stopImmediatePropagation = jasmine.createSpy("stopImmediatePropagation");
        this.stopPropagation = jasmine.createSpy("stopPropagation");
        this.preventDefault = jasmine.createSpy("preventDefault");
        Object.assign(this, attrs);
    }
}

/**
 * Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler
 */
// tslint:disable-next-line:variable-name
export const ButtonClickEvents = {
    left: new FakeMouseEvent({ button: 0 }),
    leftShift: new FakeMouseEvent({ button: 0, shiftKey: true }),
    leftCtrl: new FakeMouseEvent({ button: 0, ctrlKey: true }),
};

/**
 * Send the given event to the given element
 * @param el: HTMLELement or DebugElement to receive the event
 * @param event: Event to be dispatched
 */
export function sendEvent(el: DebugElement | HTMLElement | Node, event: Event) {
    let htmlEl: HTMLElement;
    if (el instanceof HTMLElement || el instanceof Node) {
        htmlEl = el as any;
    } else {
        htmlEl = el.nativeElement;
    }

    htmlEl.dispatchEvent(event);
}

/**
 * Simulate element click. Defaults to mouse left-button click event.
 */
export function click(el: DebugElement | HTMLElement | Node, eventObj?: any) {
    eventObj =  eventObj || new MouseEvent("click", {
        button: 0,
    });
    sendEvent(el, eventObj);
    return eventObj;
}

/**
 * Simulate element dobule click.
 */
export function dblclick(el: DebugElement | HTMLElement | Node) {
    const event = new MouseEvent("dblclick", {
        button: 0,
    });
    sendEvent(el, event);
}
/**
 * Simulate element click. Defaults to mouse left-button click event.
 */
export function rightClick(el: DebugElement | HTMLElement | Node) {
    const event = new MouseEvent("contextmenu", {
        button: 0,
    });
    sendEvent(el, event);
}

/**
 * Simulate a mouseenter event
 */
export function mouseenter(el: DebugElement | HTMLElement) {
    const event = new MouseEvent("mouseenter", { cancelable: true });
    sendEvent(el, event);
}

/**
 * Simulate a mouseleave event
 */
export function mouseleave(el: DebugElement | HTMLElement) {
    const event = new MouseEvent("mouseleave", { cancelable: true });
    sendEvent(el, event);
}

export function keydown(el: DebugElement | HTMLElement, key: string) {
    const event = new KeyboardEvent("keydown", {
        key,
    });
    sendEvent(el, event);
}

/**
 * Simulate a mousedown event
 */
export function mousedown(el: DebugElement | HTMLElement) {
    const event = new MouseEvent("mousedown", { cancelable: true });
    sendEvent(el, event);
}

/**
 * Simulate a mouseup event
 */
export function mouseup(el: DebugElement | HTMLElement, button?: MouseButton) {
    const event = new MouseEvent("mouseup", { cancelable: true, button });
    sendEvent(el, event);
}

export function updateInput(el: DebugElement | HTMLInputElement, value: any) {
    if (el instanceof DebugElement) {
        updateInput(el.nativeElement, value);
    } else {
        el.value = value;
        el.dispatchEvent(new Event("input"));
    }
}

/** Dispatches a keydown event from an element. */
export function createKeyboardEvent(type: string, keyCode: number, target?: Element, key?: string) {
    const event = document.createEvent("KeyboardEvent") as any;
    // Firefox does not support `initKeyboardEvent`, but supports `initKeyEvent`.
    const initEventFn = (event.initKeyEvent || event.initKeyboardEvent).bind(event);
    const originalPreventDefault = event.preventDefault;

    initEventFn(type, true, true, window, 0, 0, 0, 0, 0, keyCode);

    // Webkit Browsers don't set the keyCode when calling the init function.
    // See related bug https://bugs.webkit.org/show_bug.cgi?id=16735
    Object.defineProperties(event, {
        keyCode: { get: () => keyCode },
        key: { get: () => key },
        target: { get: () => target },
    });

    // IE won't set `defaultPrevented` on synthetic events so we need to do it manually.
    event.preventDefault = function () {
        Object.defineProperty(event, "defaultPrevented", { get: () => true });
        return originalPreventDefault.apply(this, arguments);
    };

    return event;
}
