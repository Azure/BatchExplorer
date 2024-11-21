export const dataGridIgnoredA11yRules = {
    rules: {
        // TODO: Re-enable this when DetailsList fixes this issue
        "aria-toggle-field-name": { enabled: false },
        // See https://github.com/microsoft/fluentui/issues/28706
        "aria-required-children": { enabled: false },
        // TODO: Figure out if this is a real issue. Started happening
        //       after upgrading to jest-axe 7.x. May be this issue:
        //       https://github.com/microsoft/fluentui/issues/18474
        "empty-table-header": { enabled: false },
    },
};
