type ElyOauthScope = "account_info" | "account_email" | "offline_access" | "minecraft_server_session";
type ElyOauthPrompt = "consent" | "select_account";

interface ElyOauthExchangeCodeResponse {
    access_token: string;
    refresh_token: string?;
    token_type: "Bearer";
    expires_in: number;
}

interface ElyOauthRefreshTokenResponse {
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
}

interface ElyOauthAccountResponse {
    id: number;
    uuid: string;
    username: string;
    registeredAt: number;
    profileLink: string;
    preferredLanguage: string;
    email?: string?;
}
