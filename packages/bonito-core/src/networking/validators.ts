/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * ported from Portal codebase
 */

import { IPv4Address } from "./ipv4-address";
import { IPv4Subnet } from "./ipv4-subnet";
import {
    getPrefixAndIPAddressFromRange,
    isValidIPv4String,
    isValidIPv6String,
} from "./ip-validators";
import { IpAddresses } from "./constants";
import { formatString, translate } from "../localization";

export interface ValidationResult {
    valid: boolean;
    message?: string;
}

export function validateIpAddress(value: string): ValidationResult {
    const result: ValidationResult = {
        valid: true,
        message: undefined,
    };

    try {
        new IPv4Address(value);

        (value || "").split(".").forEach((octet: string) => {
            // if (octet.length > 1 && StringEx.equals(octet[0], "0", StringComparison.IgnoreCase)) {
            if (octet.length > 1 && octet.startsWith("0")) {
                result.valid = false;
                // result.message =
                //     Resources.Network.Validation.leadingZerosIpAddress.format(
                //         octet,
                //         value
                //     );
                result.message = formatString(
                    translate(
                        "bonito.core.networking.validation.leadingZerosIpAddress"
                    ),
                    octet,
                    value
                );
            }
        });
    } catch (error) {
        result.valid = false;
        // result.message = Resources.Network.IpAddress.Validation.errorMessage;
        result.message = translate(
            "bonito.core.networking.validation.invalidIp"
        );
    }

    return result;
}

export interface CidrValidationOptions {
    maxCidr?: number;
    minCidr?: number;
    prefixRequired?: boolean;
    cidrBlockValidationRequired?: boolean;
    validateEmptyCidrString?: boolean;
}

// This method will validate CIDR notation as well if the entered value is a full valid CIDR block
export function performCidrValidation(
    options: CidrValidationOptions,
    value: string
): ValidationResult {
    let subnet: IPv4Subnet;
    const hasExplicitPrefix = !!value && value.split("/").length === 2;
    const result: ValidationResult = {
        valid: true,
    };

    if (options.validateEmptyCidrString) {
        try {
            // Ensure proper ip address formatting
            subnet = new IPv4Subnet(value, options.minCidr);
        } catch (error) {
            result.valid = false;
            result.message = (error as Error)?.message;
            return result;
        }
    }

    if (value) {
        try {
            // Ensure proper ip address formatting
            subnet = new IPv4Subnet(value, options.minCidr);
        } catch (error) {
            result.valid = false;
            result.message = (error as Error)?.message;
            return result;
        }

        if (options.prefixRequired && !hasExplicitPrefix) {
            // There was no prefix included, but it was required.
            result.valid = false;
            // (result.message =
            //     Resources.Network.Validation.prefix.format(value));
            result.message = translate(
                "bonito.core.networking.validation.cidrPrefix"
            );
            return result;
        }

        // Validate CIDR block
        if (options.cidrBlockValidationRequired) {
            const validIpForCidrPrefixInBytes = subnet.subnetMaskBytes;
            const validIpForCidrPrefix = IPv4Address.bytesToAddressString(
                validIpForCidrPrefixInBytes
            );
            // const isValidCidrBlock = StringEx.equals(
            //     validIpForCidrPrefix,
            //     subnet.getIpAddress(),
            //     StringComparison.IgnoreCase
            // );
            const isValidCidrBlock =
                validIpForCidrPrefix === subnet.getIpAddress();

            if (!isValidCidrBlock) {
                result.valid = false;
                // (result.message =
                //     Resources.Network.Validation.invalidCIDRBlockWithSuggestion.format(
                //         value,
                //         validIpForCidrPrefix,
                //         subnet.prefix
                //     ));
                result.message = formatString(
                    translate(
                        "bonito.core.networking.validation.invalidCIDRBlockWithSuggestion"
                    ),
                    value,
                    validIpForCidrPrefix,
                    subnet.prefix
                );
                return result;
            }
        }

        // Validate prefix if it has to be equal to a particular value
        if (hasExplicitPrefix) {
            if (
                options.maxCidr &&
                options.minCidr &&
                options.maxCidr === options.minCidr
            ) {
                if (subnet.prefix !== options.maxCidr) {
                    result.valid = false;
                    // result.message =
                    //     Resources.Network.Validation.exactPrefix.format(
                    //         options.maxCidr
                    //     );
                    result.message = formatString(
                        translate(
                            "bonito.core.networking.validation.exactPrefix"
                        ),
                        options.maxCidr
                    );
                }
            } else {
                // Else check min and max prefix conditions individually
                if (options.maxCidr && subnet.prefix > options.maxCidr) {
                    result.valid = false;
                    // result.message =
                    //     Resources.Network.Validation.maxPrefix.format(
                    //         options.maxCidr
                    //     );
                    result.message = formatString(
                        translate(
                            "bonito.core.networking.validation.maxPrefix"
                        ),
                        options.maxCidr
                    );
                }

                if (options.minCidr && subnet.prefix < options.minCidr) {
                    result.valid = false;
                    // result.message =
                    //     Resources.Network.Validation.maxPrefix.format(
                    //         options.minCidr
                    //     );
                    result.message = formatString(
                        translate(
                            "bonito.core.networking.validation.minPrefix"
                        ),
                        options.minCidr
                    );
                }
            }
        }
    }

    return result;
}

export function getIPv4andIPv6AddressValidator(
    value: string,
    isIPv6Enabled?: boolean,
    ignoreEmptyIPAddress?: boolean
): boolean {
    const isIPv6FlagEnabled = isIPv6Enabled == undefined ? true : isIPv6Enabled;

    if (isIPv6FlagEnabled) {
        const range = getPrefixAndIPAddressFromRange(value);
        const isValidIpv4Value =
            !range.hasPrefix &&
            range.ipAddress &&
            isValidIPv4String(range.ipAddress);
        const isValidIpv6Value =
            !range.hasPrefix &&
            range.ipAddress &&
            isValidIPv6String(range.ipAddress);
        return Boolean(isValidIpv4Value || isValidIpv6Value);
    } else if (
        !!value &&
        (!ignoreEmptyIPAddress || value !== IpAddresses.empty)
    ) {
        return validateIpAddress(value).valid;
    }
    return true;
}
