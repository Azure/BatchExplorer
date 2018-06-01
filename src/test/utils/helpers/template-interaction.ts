import { DebugElement } from "@angular/core";

export class FakeMouseEvent {
    public stopImmediatePropagation: jasmine.Spy;
    public stopPropagation: jasmine.Spy;
    public shiftKey = false;
    public ctrlKey = false;
    public button: number;

    constructor(attrs: any) {
        this.stopImmediatePropagation = jasmine.createSpy("stopImmediatePropagation");
        this.stopPropagation = jasmine.createSpy("stopPropagation");
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
 * Simulate element click. Defaults to mouse left-button click event.
 */
export function click(el: DebugElement | HTMLElement | Node, eventObj: any = ButtonClickEvents.left): FakeMouseEvent {
    if (el instanceof DebugElement) {
        el.triggerEventHandler("click", eventObj);
    } else if ((el as any).click) {
        (el as any).click();
    } else if (el.dispatchEvent) {
        const evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        el.dispatchEvent(evt);
    }
    return eventObj;
}

/**
 * Simulate element dobule click.
 */
export function dblclick(el: DebugElement | HTMLElement | Node) {
    if (el instanceof DebugElement) {
        el.triggerEventHandler("dblclick", new FakeMouseEvent({}));
    } else if ((el as any).click) {
        (el as any).click();
    } else if (el.dispatchEvent) {
        const evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("dblclick", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        el.dispatchEvent(evt);
    }
}
/**
 * Simulate element click. Defaults to mouse left-button click event.
 */
export function rightClick(el: DebugElement | HTMLElement | Node) {
    if (el instanceof DebugElement) {
        el.triggerEventHandler("contextmenu", new FakeMouseEvent({}));
    } else if ((el as any).contextmenu) {
        (el as any).contextmenu();
    } else if (el.dispatchEvent) {
        const evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("contextmenu", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        el.dispatchEvent(evt);
    }
}

/**
 * Simulate a mouseenter event
 */
export function mouseenter(el: DebugElement | HTMLElement) {
    const event = new MouseEvent("mouseleave", { cancelable: true });
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
 * Send the given event to the given element
 * @param el: HTMLELement or DebugElement to receive the event
 * @param event: Event to be dispatched
 */
export function sendEvent(el: DebugElement | HTMLElement, event: Event) {
    let htmlEl: HTMLElement;
    if (el instanceof HTMLElement) {
        htmlEl = el;
    } else {
        htmlEl = el.nativeElement;
    }

    htmlEl.dispatchEvent(event);
}

/**
 * Simulate a mousedown event
 */
export function mousedown(el: DebugElement | HTMLElement) {
    const event = new MouseEvent("mousedown", { cancelable: true });
    if (el instanceof HTMLElement) {
        el.dispatchEvent(event);
    } else {
        el.triggerEventHandler("mousedown", event);
    }
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
