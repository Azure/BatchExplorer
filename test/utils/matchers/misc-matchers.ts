
function toBeBlank() {
    return {
        compare: (actual, expected) => {
            return { pass: (!actual || /^\s*$/.test(actual)) };
        },
    };
}

export const matchers = {
    toBeBlank,
};
