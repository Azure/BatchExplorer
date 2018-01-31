import { logger } from "client/logger";
import { AADUser } from "./aad-user";

export class UserDecoder {
    public decode(encoded: string): AADUser {

        const jwtDecoded = this.decodeJwt(encoded);
        if (!jwtDecoded) {
            throw Error("Failed to decode value. Value has invalid format.");
        }

        let decodedPayLoad = this.safeDecodeBase64(jwtDecoded.JWSPayload);

        let user = JSON.parse(decodedPayLoad);

        // if (!user || !user.ha    sOwnProperty('aud')) throw new Error('');

        return user as AADUser;
    }

    private safeDecodeBase64(value: string) {

        let base64Decoded = this.base64DecodeStringUrlSafe(value);
        if (!base64Decoded) {
            throw Error("Failed to base64 decode value. Value has invalid format.");
        }

        return base64Decoded;
    }

    private decodeJwt(jwtToken: string) {

        const idTokenPartsRegex = /^([^\.\s]*)\.([^\.\s]+)\.([^\.\s]*)$/;

        const matches = idTokenPartsRegex.exec(jwtToken);
        if (!matches || matches.length < 4) {
            throw new Error(`Failed to decode Jwt token. The token has invalid format. Actual token: '${jwtToken}'`);
        }

        const crackedToken = {
            header: matches[1],
            JWSPayload: matches[2],
            JWSSig: matches[3],
        };

        return crackedToken;
    }

    private base64DecodeStringUrlSafe(base64IdToken: string) {
        // html5 should support atob function for decoding
        base64IdToken = base64IdToken.replace(/-/g, "+").replace(/_/g, "/");
        logger.info("Decoding string", base64IdToken, (new Buffer(base64IdToken, "base64")).toString("utf8"));
        return (new Buffer(base64IdToken, "base64")).toString("utf8");
    }
}
