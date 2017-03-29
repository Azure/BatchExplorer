export interface SubtleCryptoWrapper {
    subtle: SubtleCrypto;
    isLegacyApi: boolean;
    subtleVersion: string;
}

export class SharedKeyUtils {
    public static getSubtleCrypto(): SubtleCryptoWrapper {

        if ((<any>window).crypto && (<any>window).crypto.subtle) {
            return {
                subtle: ((<any>window).crypto.subtle),
                isLegacyApi: false,
                subtleVersion: "window.crypto",
            };
        } else if ((<any>window).crypto && (<any>window).crypto.webkitSubtle) {
            // Apples Safari browser still provides the Web Cryptography API via a prefixed name.
            // Instead of using window.crypto.subtle you would use window.crypto.webkitSubtle.
            return {
                subtle: ((<any>window).crypto.webkitSubtle),
                isLegacyApi: true,
                subtleVersion: "window.webkitSubtle",
            };
        } else if ((<any>window).msCrypto) {
            return {
                subtle: ((<any>window).msCrypto.subtle),
                isLegacyApi: true,
                subtleVersion: "window.msCrypto",
            };
        } else {
            return {
                subtle: ((<any>window).msrCrypto.subtle),
                isLegacyApi: true,
                subtleVersion: "window.msrCrypto",
            };
        }
    }

    /**
     * Converts Arrays, ArrayBuffers, TypedArrays, and Strings to to either a Uint8Array
     * or a regular Array depending on browser support. You should use this when passing byte
     * data in or out of crypto functions
     */
    public static toSupportedArray(data: any) {
        // does this browser support Typed Arrays?
        const typedArraySupport = (typeof Uint8Array !== "undefined");

        // get the data type of the parameter
        let dataType = Object.prototype.toString.call(data);
        dataType = dataType.substring(8, dataType.length - 1);

        // determine the type
        switch (dataType) {
            // Regular JavaScript Array. Convert to Uint8Array if supported
            // else do nothing and return the array
            case "Array":
                return typedArraySupport ? new Uint8Array(data) : data;

            // ArrayBuffer. IE11 Web Crypto API returns ArrayBuffers that you have to convert
            // to Typed Arrays. Convert to a Uint8Arrays and return;
            case "ArrayBuffer":
                return new Uint8Array(data);

            // Already Uint8Array. Obviously there is support.
            case "Uint8Array":
                return data;

            case "Uint16Array":
            case "Uint32Array":
                return new Uint8Array(data);

            // String. Convert the string to a byte array using Typed Arrays if
            // supported.
            case "String":
                const newArray = typedArraySupport ? new Uint8Array(data.length) : new Array(data.length);
                for (let i = 0; i < data.length; i += 1) {
                    newArray[i] = data.charCodeAt(i);
                }

                return newArray;

            // Some other type. Just return the data unchanged.
            default:
                throw new Error("toSupportedArray : unsupported data type " + dataType);
        }
    }
}
