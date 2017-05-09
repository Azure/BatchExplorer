export interface UserAccountDto {
    name: string;
    password: string;
    elevationLevel?: "nonAdmin" | "admin";
    sshPrivateKey?: string;
}
