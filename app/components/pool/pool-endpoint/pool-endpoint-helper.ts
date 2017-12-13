import { FormControl, FormGroup } from "@angular/forms";

export const MININUM_PORT: number = 1;
export const MAXIMUM_BACKEND_PORT: number = 65535;
export const RESERVED_BACKEND_PORT: number[] = [22, 3389, 29876, 29877];
export const MAXIMUM_FRONTEND_PORT: number = 65534;
export const MINIMUM_RESERVED_FRONTEND_PORT: number = 50000;
export const MAXIMUM_RESERVED_FRONTEND_PORT: number = 55000;
export const MINIMUM_FRONTEND_PORT_RANGE = 40;

// const defaultReservedFrontendPortEnd: number = 49999;

// const minSecurityGroupRulePriority: number = 150;
// const maxSecurityGroupRulePriority: number = 3500;
// const endpointNameLength: number = 77;

/**
 * backendPortValidator is a custom validator that validates backend port input
 * Two requirements must be met:
 * 1, Backend port must be between 1 and 65535
 * 2, Backend port must not be reserved ports
 */
export function backendPortValidator() {
    return (control: FormControl): {[key: string]: any} => {
        if (control.value === null) {
            return null;
        }
        if (control.value < MININUM_PORT || control.value > MAXIMUM_BACKEND_PORT) {
            return {
                invalidRange: {
                    value: control.value,
                },
            };
        }
        if (RESERVED_BACKEND_PORT.includes(control.value)) {
            return {
                reservedPort: {
                    value: control.value,
                },
            };
        }
        return null;
    };
}

/**
 * frontendPortValidator is a custom validator that validates frontend port input
 * Two requirements must be met:
 * 1, Frontend port must be between 1 and 65534
 * 2, Frontend port must not be between 50000 and 55000
 */
export function frontendPortValidator() {
    return (control: FormControl): {[key: string]: any} => {
        if (control.value === null) {
            return null;
        }
        if (control.value < MININUM_PORT || control.value > MAXIMUM_FRONTEND_PORT) {
            return {
                invalidRange: {
                    value: control.value,
                },
            };
        }
        if (control.value >= MINIMUM_RESERVED_FRONTEND_PORT && control.value <= MAXIMUM_RESERVED_FRONTEND_PORT) {
            return {
                reservedPort: {
                    value: control.value,
                },
            };
        }
        return null;
    };
}

/**
 * frontendPortRangeValidator is a custom validator that validator frontend port input range
 * Two requirements must be met
 * 1, Frontend port start must be smaller than frontend port end
 * 2, Frontend port range must contain at least 40 ports
 */
export function frontendPortRangeValidator(frontendPortRangeStart: string, frontendPortRangeEnd: string) {
    return (group: FormGroup): {[key: string]: any} => {
        const start = group.controls[frontendPortRangeStart];
        const end = group.controls[frontendPortRangeEnd];
        if (start.value === null || end.value === null) {
            return null;
        }
        if (start.value >= end.value) {
            return {
                invalidFrontEnd: true,
            };
        }
        if ((end.value - start.value + 1) < MINIMUM_FRONTEND_PORT_RANGE) {
            return {
                insufficientPorts: true,
            };
        }
        return null;
      };
}
