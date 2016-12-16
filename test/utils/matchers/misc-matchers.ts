function toBeBlank() {
    return {
        compare: (actual, expected) => {
            return { pass: (!actual || /^\s*$/.test(actual)) };
        },
    };
}

function toBeVisible() {
    return {
        compare: (actual: any, expected) => {
            let element: HTMLElement;
            if (actual.nativeElement) {
                element = actual.nativeElement;
            } else if (actual instanceof HTMLElement) {
                element = actual;
            }
            return { pass: element.offsetParent !== null, message: "Expected to be visible" };
        },
    };
}

function toBeHidden() {
    return {
        compare: (actual: any, expected) => {
            let element: HTMLElement;
            if (actual.nativeElement) {
                element = actual.nativeElement;
            } else if (actual instanceof HTMLElement) {
                element = actual;
            }
            return { pass: element.offsetParent === null, message: "Expected to be visible" };
        },
    };
}

export const matchers = {
    toBeBlank,
    toBeVisible,
    toBeHidden,
};
