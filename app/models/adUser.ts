export interface ADUser {
    aud?: string;
    iss?: string;
    iat?: number;
    nbf?: number;
    exp?: number;
    amr?: string[];
    family_name?: string;
    given_name: string;
    ipaddr: string;
    name: string;
    nonce?: string;
    oid?: string;
    platf?: string;
    sub?: string;
    tid?: string;
    unique_name: string;
    upn?: string;
    ver?: string;
}
