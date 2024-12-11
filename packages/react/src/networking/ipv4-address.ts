/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * ported from Portal repo
 */

import { translate } from "@azure/bonito-core";
import { formatString } from "@azure/bonito-core/lib/localization";

export class IPv4Address {
    /**
     * The IPv4 Address.
     * Should be a number array of length 4
     * ex: 192.168.1.0 => [192, 168, 1, 0]
     */
    public address: number[];

    /**
     * The number representation of the actual byte value of the entire address
     */
    public subnetBytes!: number;

    /**
     * Creates a new instance of the IPv4Address class
     * This class is used to validate and work with IPv4 Addresses
     * @param address, a string of the address to create the class with.
     */
    constructor(address: string, allowFirstOctetZero = false) {
        if (!address) {
            throw new Error(
                translate("lib.react.networking.validation.nonNullAddress")
            );
        }

        this.address = address.split(".").map((token) => {
            if (!this._isNumeric(token)) {
                throw new Error(
                    formatString(
                        translate(
                            "lib.react.networking.validation.malformedAddress"
                        ),
                        address
                    )
                );
            }
            return parseInt(token, 10);
        });

        this._validateIpValue(allowFirstOctetZero);

        this._calculateByteValues();
    }

    /**
     * Prints a friendly representation of the IP Address
     * @returns string of the IPAddress segment of the Subnet (no prefix)
     */
    public toString(): string {
        return IPv4Address.bytesToAddressString(this.subnetBytes);
    }

    /**
     * Checks that two IPs are equivalent.
     * @param rhs, The IP to check against this one.
     * @returns true if the IPs are identical
     */
    public equals(rhs: IPv4Address): boolean {
        return this.subnetBytes === rhs.subnetBytes;
    }

    /**
     * Checks that this IP is in a given range [startIp, endIp).
     * @param start, the first IP in the range
     * @param end, one after the last IP in the range
     * @returns true if the the IP is in the range [startIp, endIp)
     */
    public isIpInRange(start: IPv4Address, end: IPv4Address): boolean {
        return (
            start.subnetBytes <= this.subnetBytes &&
            this.subnetBytes < end.subnetBytes
        );
    }

    public static bytesToAddressString(bytes: number): string {
        return formatString(
            "{0}.{1}.{2}.{3}",
            (bytes & 0xff000000) >>> 24,
            (bytes & 0xff0000) >>> 16,
            (bytes & 0xff00) >>> 8,
            (bytes & 0xff) >>> 0
        );
    }

    protected _isNumeric(value: string) {
        return /^[0-9]+$/.test(value);
    }

    private _validateIpValue(allowFirstOctetZero = false): void {
        if (this.address.length !== 4) {
            throw new Error(
                formatString(
                    translate(
                        "lib.react.networking.validation.malformedAddress"
                    ),
                    this.address.join(".")
                )
            );
        }

        this._validateOctet(0, allowFirstOctetZero);
        this._validateOctet(1);
        this._validateOctet(2);
        this._validateOctet(3);
    }

    protected _validateOctet(octet: number, allowFirstOctetZero = false): void {
        // The first octet is a special case
        // The first octet has to be at least 1 unless allowing the first octet to be zero
        if (
            isNaN(this.address[octet]) ||
            this.address[octet] <
                (octet === 0 ? (allowFirstOctetZero ? 0 : 1) : 0) ||
            this.address[octet] > 255
        ) {
            throw new Error(
                formatString(
                    translate("lib.react.networking.validation.octet"),
                    octet + 1,
                    this.address[octet],
                    octet === 0 ? 1 : 0,
                    255
                )
            );
        }
    }

    private _calculateByteValues(): void {
        this.subnetBytes =
            (((this.address[0] << 24) >>> 0) |
                ((this.address[1] << 16) >>> 0) |
                ((this.address[2] << 8) >>> 0) |
                ((this.address[3] << 0) >>> 0)) >>>
            0;
    }
}

export function safeGetIpv4Address(address: string): IPv4Address | null {
    if (address) {
        try {
            return new IPv4Address(address);
        } catch (ex) {
            // empty block
        }
    }

    return null;
}
