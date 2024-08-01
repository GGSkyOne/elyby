interface ElyClientRefreshTokenResponse {
    accessToken: string;
    clientToken: string;
    selectedProfile: ElyClientProfile;
    user?: ElyClientUser;
}

interface ElyClientAuthentificateResponse extends ElyClientRefreshTokenResponse {
    availableProfiles: Array<ElyClientProfile>;
}

interface ElyClientProfile {
    id: string;
    name: string;
}

interface ElyClientUser {
    id: string;
    username: string;
    properties: Array<ElyClientUserProperty>;
}

interface ElyClientUserProperty {
    name: string;
    value: string;
}
