// ported from Portal codebase

import { CidrConstants } from "./constants";
import { formatString, translate } from "../localization";
import { ValidationResult } from "./validators";

export interface IPv6CidrValidationOptions {
    prefixRequired: boolean;
    minAllowedPrefix?: number;
    maxAllowedPrefix?: number;
    escapeEmpty?: boolean;
}

export interface IPAddressRange {
    prefix: string;
    ipAddress: string;
}

export function isValidIPv6String(ipString: string) {
    const regex = new RegExp(
        /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*$/
    );
    return regex.test(ipString);
}

export function isValidIPv6RangeForWafCusomRules(ipString: string) {
    const regex = new RegExp(
        /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/
    );
    return regex.test(ipString);
}

export function isValidIPv4String(ipString: string) {
    const regex = new RegExp(
        /^(0?[0-9]?[0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.(0?[0-9]?[0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.(0?[0-9]?[0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.(0?[0-9]?[0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/
    );
    return regex.test(ipString);
}

export function isValidIPv6Prefix(
    prefixString: string,
    options: IPv6CidrValidationOptions
) {
    const prefix = parseInt(prefixString, 10);
    if (isNaN(prefix)) {
        return false;
    } else if (
        (options.minAllowedPrefix && options.minAllowedPrefix > prefix) ||
        (options.maxAllowedPrefix && prefix > options.maxAllowedPrefix)
    ) {
        return false;
    }

    return true;
}

export function getPrefixAndIPAddressFromRange(ipAddressRange: string) {
    const hasPrefix =
        !!ipAddressRange && ipAddressRange.split("/").length === 2;
    const cidrNotation = (hasPrefix && ipAddressRange.split("/")) || [
        null,
        null,
    ];

    return {
        hasPrefix: hasPrefix,
        prefix: hasPrefix ? cidrNotation[1] : null,
        ipAddress: hasPrefix ? cidrNotation[0] : ipAddressRange,
    };
}

export function validateIPv6prefixShouldNotBePresent(
    value: string
): ValidationResult {
    const result: ValidationResult = {
        valid: true,
    };

    const addressRange = getPrefixAndIPAddressFromRange(value);

    if (addressRange.prefix) {
        result.valid = false;
        // result.message = Resources.Network.Validation.MalformedIPv6.noPrefix;
        result.message = translate(
            "bonito.core.networking.validation.malformedIPv6"
        );
        return result;
    }

    return result;
}

export function performIPv6CidrValidation(
    value: string,
    options: IPv6CidrValidationOptions
): ValidationResult {
    const result: ValidationResult = {
        valid: true,
    };

    if (!value && !options.escapeEmpty) {
        result.valid = false;
        // result.message = Resources.Network.Validation.inValidIPv6AddressRange;
        result.message = translate(
            "bonito.core.networking.validation.invalidIPv6AddressRange"
        );
        return result;
    }

    const addressRange = getPrefixAndIPAddressFromRange(value);
    const isValidPrefix = isValidIPv6Prefix(addressRange.prefix || "", options);
    const isValidIPv6 = isValidIPv6String(addressRange.ipAddress || "");
    const validatePrefix = addressRange.hasPrefix || options.prefixRequired;

    if (!isValidIPv6 && value) {
        result.valid = false;
        // result.message = Resources.Network.Validation.malformedIPv6;
        result.message = translate(
            "bonito.core.networking.validation.malformedIPv6"
        );

        if (!options.prefixRequired) {
            return result;
        }
    }

    if (validatePrefix && !isValidPrefix) {
        result.valid = false;
        if (
            options.maxAllowedPrefix &&
            options.minAllowedPrefix &&
            options.maxAllowedPrefix === options.minAllowedPrefix
        ) {
            // result.message = Resources.Network.Validation.exactPrefix.format(
            //     options.maxAllowedPrefix
            // );
            formatString(
                translate("bonito.core.networking.validation.exactPrefix"),
                options.maxAllowedPrefix
            );
        } else {
            // result.message =
            //     Resources.Network.Validation.ipv6PrefixMessage.format(
            //         options.minAllowedPrefix,
            //         options.maxAllowedPrefix
            //     );
            result.message = formatString(
                translate(
                    "bonito.core.networking.validation.ipv6PrefixMessage"
                ),
                options.minAllowedPrefix || CidrConstants.minIPv6Prefix,
                options.maxAllowedPrefix || CidrConstants.maxIPv6Prefix
            );
        }
    }

    return result;
}
