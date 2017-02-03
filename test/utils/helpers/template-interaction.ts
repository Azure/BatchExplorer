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
export const ButtonClickEvents = {
    left: new FakeMouseEvent({ button: 0 }),
    leftShift: new FakeMouseEvent({ button: 0, shiftKey: true }),
    leftCtrl: new FakeMouseEvent({ button: 0, ctrlKey: true }),
    right: new FakeMouseEvent({ button: 2 }),
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
 * Simulate a mouseenter event
 */
export function mouseenter(el: DebugElement | HTMLElement) {
    if (el instanceof HTMLElement) {
        el.dispatchEvent(new Event("mouseenter"));
    } else {
        el.triggerEventHandler("mouseenter", {});
    }
}

/**
 * Simulate a mouseleave event
 */
export function mouseleave(el: DebugElement | HTMLElement) {
    if (el instanceof HTMLElement) {
        el.dispatchEvent(new Event("mouseleave"));
    } else {
        el.triggerEventHandler("mouseleave", {});
    }
}
