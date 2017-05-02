export interface UserAccountDto {
    username: string;
    password: string;
    elevationLevel?: "nonAdmin" | "admin";
    sshPrivateKey?: string;
}
