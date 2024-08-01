interface ElyApiUsernameByUuidProfile {
    name: string;
    changedToAt?: number;
}

interface ElyApiProfileByUuidResponse {
    id: string;
    name: string;
    properties: Array<ElyClientUserProperty>;
}
