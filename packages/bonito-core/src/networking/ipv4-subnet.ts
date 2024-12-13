/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * ported from Portal codebase
 */

import { translate, formatString } from "../localization";
import { IPv4Address } from "./ipv4-address";

export class IPv4Subnet extends IPv4Address {
    /**
     * The first private IP address ranges in string form for each private IP address group.
     */
    public static firstPrivateAddressA = "10.0.0.0";
    public static firstPrivateAddressB = "172.16.0.0";
    public static firstPrivateAddressC = "192.168.0.0";

    /**
     * The IPv4 Subnet Prefix.
     * Should be a number between 1 and 32
     */
    public prefix!: number;

    /**
     * The number representaiton of the actual byte value of the subnet Net mask
     */
    public subnetNetMaskBytes!: number;

    /**
     * The number representaiton of the actual byte value of the subnet mask
     */
    public subnetMaskBytes!: number;

    /**
     * The number representaiton of the actual byte value of the subnet's broadcast address
     */
    public subnetBroadcastAddressBytes!: number;

    /**
     * Creates a new instance of the IPv4Subnet class
     * This class is used to validate and work with IPv4 Subnets
     * @param subnetCidr, a string of the subnet to create the class with. Accepted values are IP, or IP/Prefix
     * @param minPrefix, optional minimum prefix value
     * @param maxPrefix, optional maximum prefix value
     */
    constructor(
        subnetCidr: string,
        minPrefix = 1,
        maxPrefix = 32,
        allowFirstOctetZero = false
    ) {
        if (!subnetCidr) {
            throw new Error(
                translate("bonito.core.networking.validation.nonNullSubnet")
            );
        }

        const subnetTokens = subnetCidr.split("/");

        super(subnetTokens[0], allowFirstOctetZero);

        // Assume the user passed in a simple IP Address. Give them a prefix of 32 because we're nice
        if (subnetTokens.length === 1) {
            this.prefix = 32;
        } else if (subnetTokens.length > 2) {
            // Too many slashes!
            formatString(
                translate("bonito.core.networking.validation.malformedSubnet"),
                subnetCidr
            );
            // throw new Error(
            //     Resources.Network.Validation.malformedSubnet.format(subnetCidr)
            // );
        } else {
            // If they don't give us a proper number, set to -1 so _validatePrefix throws.
            this.prefix = this._isNumeric(subnetTokens[1])
                ? parseInt(subnetTokens[1], 10)
                : -1;
        }

        this._validatePrefix(minPrefix, maxPrefix);
        this._calculateSubnetByteValues();
    }

    /**
     * Prints a friendly representation of the IP Subnet
     * @returns string of the entire subnet, including the prefix
     */
    public toString(): string {
        return `${super.toString()}/${this.prefix}`;
        // return "{0}/{1}".format(super.toString(), this.prefix);
    }

    /*
     * Determines if another subnet is completely contained in this subnet
     * @param subnet IPv4Subnet the other subnet to test
     * @returns boolean. true if the other subnet is completely contained in this subnet. false otherwise.
     */
    public isOtherSubnetContained(subnet: IPv4Subnet): boolean {
        return (
            this.prefix <= subnet.prefix &&
            (this.subnetNetMaskBytes & subnet.subnetBroadcastAddressBytes) >>>
                0 ===
                this.subnetMaskBytes
        );
    }

    /**
     * Determines if another subnet overlaps this one
     * @param subnet IPv4Subnet the other subnet to test
     * @returns boolean. true if the two subnets overlap with eachother. false otherwise
     */
    public doesSubnetOverlap(subnet: IPv4Subnet): boolean {
        return (
            this.isOtherSubnetContained(subnet) ||
            subnet.isOtherSubnetContained(this)
        );
    }

    /**
     * Returns a number of usable ip addresses for this subnet
     * @param beginOffset optional offset for the beginning range. This is a count of addresses not included in the range
     * @param endOffset optional offset for the end of the range. This is the count of address not included in the range
     * @returns number of usable address in the range, not including the offsets.
     */
    public getUsableIpAddressCount(
        beginOffset?: number,
        endOffset?: number
    ): number {
        // We take the entire range not counting the broadcast address
        // Then remove the begin offset and the end offset
        beginOffset = beginOffset ? beginOffset : 0;
        endOffset = endOffset ? endOffset : 0;
        return (
            this.subnetBroadcastAddressBytes -
            ((this.subnetBytes & this.subnetNetMaskBytes) >>> 0) -
            beginOffset -
            endOffset +
            1
        );
    }

    /**
     * Gets the nth IP Address in this subnet
     * @param offset The offset of how many ip addresses to give. 0 by default
     * @returns A string of the ip address
     */
    public getIpAddress(offset?: number): string {
        const offsetToUse = offset ? offset : 0;

        if (this.getUsableIpAddressCount() < offsetToUse) {
            throw new Error(
                "offset: The requested IP Address is not in this subnet"
            );
        }

        return IPv4Address.bytesToAddressString(this.subnetBytes + offsetToUse);
    }

    protected _validateOctet(octet: number): void {
        if (
            isNaN(this.address[octet]) ||
            this.address[octet] < 0 ||
            this.address[octet] > 255
        ) {
            throw new Error(
                formatString(
                    translate("bonito.core.networking.validation.octet"),
                    octet + 1,
                    this.address[octet],
                    0,
                    255
                )
            );
            // throw new Error(
            //     Resources.Network.Validation.octet.format(
            //         octet + 1,
            //         this.address[octet],
            //         0,
            //         255
            //     )
            // );
        }
    }

    private _validatePrefix(minPrefix: number, maxPrefix: number): void {
        if (this.prefix < minPrefix || this.prefix > maxPrefix) {
            throw new Error(
                formatString(
                    translate(
                        "bonito.core.networking.validation.formattedPrefix"
                    ),
                    minPrefix,
                    maxPrefix
                )
            );
            // throw new Error(
            //     Resources.Network.Validation.formattedPrefix.format(
            //         minPrefix,
            //         maxPrefix
            //     )
            // );
        }
    }

    private _calculateSubnetByteValues(): void {
        // If the prefix is 0, set the subnetNetMaskBytes to 0 because javascript cannot accurately left bit shift by 32 due to numbers being 32 bits
        this.subnetNetMaskBytes =
            this.prefix === 0 ? 0 : (0xffffffff << (32 - this.prefix)) >>> 0;
        this.subnetMaskBytes =
            (this.subnetNetMaskBytes & this.subnetBytes) >>> 0;
        this.subnetBroadcastAddressBytes =
            (((this.subnetNetMaskBytes ^ 0xffffffff) >>> 0) |
                this.subnetBytes) >>>
            0;
    }
}

export function safeGetIpv4Subnet(addressPrefix: string): IPv4Subnet | null {
    if (addressPrefix) {
        try {
            return new IPv4Subnet(addressPrefix);
        } catch (ex) {
            // empty block
        }
    }

    return null;
}
