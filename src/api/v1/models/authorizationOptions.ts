export interface AuthorizationOptions {
    hasRole: Array<"doctor" | "manager" | "user" | "admin">;
    allowSameUser?: boolean;
}