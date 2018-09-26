import { FormControl, FormGroup } from "@angular/forms";

import { InboundNATPoolAttributes } from "app/models";

export const MININUM_PORT = 1;
export const MAXIMUM_BACKEND_PORT = 65535;
export const RESERVED_BACKEND_PORT: number[] = [29876, 29877];
export const MAXIMUM_FRONTEND_PORT = 65534;
export const MINIMUM_RESERVED_FRONTEND_PORT = 50000;
export const MAXIMUM_RESERVED_FRONTEND_PORT = 55000;
export const MINIMUM_FRONTEND_PORT_RANGE = 40;
export const MAXIMUM_SECURITY_GROUP_RULES = 25;
export const MINIMUM_SECURITY_GROUP_RULE_PRIORITY = 150;
export const MAXIMUM_SECURITY_GROUP_RULE_PRIORITY = 3500;
export const ENDPOINTNAME_REGEX = "^(?=.{0,77}$)[0-9a-zA-Z][a-zA-Z0-9_.-]*[0-9a-zA-Z_]*$";
export const ENDPOINTNAME_LENGTH = 77;

/**
 * backendPortValidator is a custom validator that validates backend port input
 * Three requirements must be met:
 * 1, Backend port must be between 1 and 65535
 * 2, Backend port must not be reserved ports
 * 3, Backend port must be unique within Batch pool
 */
export function backendPortValidator(inboundNATPools: InboundNATPoolAttributes[]) {
    return (control: FormControl): {[key: string]: any} => {
        if (control.value === null) {
            return null;
        }
        if (inboundNATPools) {
            let hasDuplicate = false;
            if (inboundNATPools) {
                for (const pool of inboundNATPools) {
                    if (control.value === pool.backendPort) {
                        hasDuplicate = true;
                        break;
                    }
                }
            }
            if (hasDuplicate) {
                return {
                    duplicateValue: {
                        value: control.value,
                    },
                };
            }
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
 * 2, Frontend port must not be between 50000 and 55000 which are reserved ports
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
 * Three requirements must be met
 * 1, Frontend port start must be smaller than frontend port end
 * 2, Frontend port range must contain at least 40 ports
 * 3, Frontend port must not be overlapped with other port ranges
 */
export function frontendPortRangeValidator(frontendPortRangeStart: string,
                                           frontendPortRangeEnd: string,
                                           inboundNATPools: InboundNATPoolAttributes[]) {
    return (group: FormGroup): {[key: string]: any} => {
        const start = group.controls[frontendPortRangeStart];
        const end = group.controls[frontendPortRangeEnd];
        if (start.value === null || end.value === null) {
            return null;
        }
        // Basic validation
        if (start.value >= end.value) {
            return {
                invalidFrontEnd: true,
            };
        }
        // Front end port should satisfy minimum amount of port
        if ((end.value - start.value + 1) < MINIMUM_FRONTEND_PORT_RANGE) {
            return {
                insufficientPorts: true,
            };
        }
        // Check whether front end port overlapped or not
        let hasOverlap = false;
        let overlapStart = null;
        let overlapEnd = null;
        if (inboundNATPools) {
            for (const pool of inboundNATPools) {
                // Overlap algorithm can be defined like:
                // bool overlap = a.start <= b.end && b.start <= a.end; (inclusive)
                if (start.value <= pool.frontendPortRangeEnd &&
                    end.value >= pool.frontendPortRangeStart) {
                    hasOverlap = true;
                    overlapStart = pool.frontendPortRangeStart;
                    overlapEnd = pool.frontendPortRangeEnd;
                    break;
                }
            }
        }
        if (hasOverlap) {
            return {
                overlappedRange: {
                    start: overlapStart,
                    end: overlapEnd,
                },
            };
        }
        return null;
    };
}

/**
 * nameValidator is a custom validator that validates endpoint name input
 * Two requirements must be met:
 * 1, Endponit name must be valid that contain letters, numbers, underscores, periods, and hyphens.
 *    Names must start with a letter or number, must end with a letter, number, or underscore,
 *    and cannot exceed 77 characters.
 * 2, Endponit name must be unique within a Batch pool
 */
export function nameValidator(inboundNATPools: InboundNATPoolAttributes[]) {
    return (control: FormControl): {[key: string]: any} => {
        if (control.value === null) {
            return null;
        }
        // Check endpoint regex test pass or not
        const nameRegex = new RegExp(ENDPOINTNAME_REGEX);
        if (control.value && !nameRegex.test(control.value)) {
            return {
                invalidValue: {
                    value: control.value,
                },
            };
        }
        // Check whether name is duplicate
        let hasDuplicate = false;
        if (inboundNATPools) {
            for (const pool of inboundNATPools) {
                if (control.value === pool.name) {
                    hasDuplicate = true;
                    break;
                }
            }
        }
        return hasDuplicate ? {
            duplicateValue: {
                value: control.value,
            },
        } : null;
    };
}

/**
 * networkSecurityGroupRuleValidator is a custom validator that validates network security group rule priority
 * One requirement must be met:
 * 1, networkSecurityGroupRules priority must be unique across different inbound NAT pools
 */
export function networkSecurityGroupRuleValidator(networkSecurityGroupRules: string,
                                                  inboundNATPools: InboundNATPoolAttributes[]) {
    return (group: FormGroup): {[key: string]: any} => {
        const control = group.controls[networkSecurityGroupRules];
        if (control.value === null) {
            return null;
        }
        let hasDuplicate = false;
        const currentPriorities = control.value.map(rule => rule.priority);
        for (const pool of inboundNATPools) {
            const otherPriorities = pool.networkSecurityGroupRules.map(rule => rule.priority);
            const duplicate = otherPriorities.filter(priority => currentPriorities.includes(priority));
            if (duplicate && duplicate.length > 0) {
                hasDuplicate = true;
                break;
            }
        }
        return hasDuplicate ? {
            duplicatePriority: {
                valid: false,
            },
        } : null;
    };
}
