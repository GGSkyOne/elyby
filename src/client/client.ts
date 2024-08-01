import { consola } from "consola";
import { FetchError, ofetch } from "ofetch";

const authBaseUrl = "https://authserver.ely.by";

/**
 * Contains methods useful for Minecraft and launcher authentication.
 * @class
 */
export default class ElyClient {
    private clientToken: string;

    constructor(clientToken: string) {
        try {
            if (!clientToken) throw new Error("Required parameter is missing: clientToken");
        } catch (error) {
            consola.error(error);
        }

        this.clientToken = clientToken;
    }

    /**
     * Direct authentication of the user using their login (username or E-mail), password and two-factor authentication token. {@link https://docs.ely.by/en/minecraft-auth.html#id3|Read more here}.
     *
     * The Ely.by accounts system supports additional user security with two-factor authentication. The Mojang’s authentication protocol doesn’t provide the possibility to pass TOTP tokens. To solve this problem and maintain compatibility with Yggdrasil’s server implementation, we suggest passing the token in the password field as password:token.
     * @param {string} username User’s nickname or their E-mail (preferable).
     * @param {string} password User’s password or password:token combination.
     * @param {boolean} requestUser If the field is passed as true, the user field will be present in the server response.
     */
    public async authenticate(username: string, password: string, requestUser: boolean) {
        const user = await ofetch<ElyClientAuthentificateResponse>("/auth/authenticate", {
            baseURL: authBaseUrl,
            method: "POST",
            body: {
                username: username,
                password: password,
                clientToken: this.clientToken,
                requestUser: requestUser,
            },
        }).catch((error: FetchError) => {
            consola.error(new Error(`${error}. ${error.data.errorMessage}`));
            return null;
        });

        return user;
    }

    /**
     * Updates a valid accessToken. This request allows you to store not the client’s password, but only the saved accessToken value for an almost infinite ability to pass authentication. {@link https://docs.ely.by/en/minecraft-auth.html#id3|Read more here}.
     *
     * If you receive any of the provided errors, you should re-request the user password and perform normal authentication.
     * @param {string} accessToken The access token received after authentication.
     * @param {boolean} requestUser If the field is passed as true, the user field will be present in the server response.
     */
    public async refresh(accessToken: string, requestUser: boolean) {
        const user = await ofetch<ElyClientRefreshTokenResponse>("/auth/refresh", {
            baseURL: authBaseUrl,
            method: "POST",
            body: {
                accessToken: accessToken,
                clientToken: this.clientToken,
                requestUser: requestUser,
            },
        }).catch((error: FetchError) => {
            consola.error(new Error(`${error}. ${error.data.errorMessage}`));
            return null;
        });

        return user;
    }

    /**
     * This request allows you to check whether the specified accessToken is valid or not. This request does not update the token or its lifetime, but only makes sure that it is still valid. {@link https://docs.ely.by/en/minecraft-auth.html#id3|Read more here}.
     * @param {string} accessToken The access token received after authentication.
     * @example
     */
    public async validate(accessToken: string) {
        const response = await ofetch("/auth/validate", {
            baseURL: authBaseUrl,
            method: "POST",
            body: {
                accessToken: accessToken,
            },
        }).catch((error: FetchError) => {
            if (error.statusCode === 401) {
                return false;
            } else {
                consola.error(new Error(`${error}. ${error.data.errorMessage}`));
                return null;
            }
        });

        return response === false ? false : true;
    }

    /**
     * This request enables the invalidation of all tokens issued to the user. {@link https://docs.ely.by/en/minecraft-auth.html#id3|Read more here}.
     *
     * A successful response will be an empty body.
     * @param {string} username User’s nickname or their E-mail (preferable).
     * @param {string} password User’s password or password:token combination.
     */
    public async signout(username: string, password: string) {
        const response = await ofetch("/auth/signout", {
            baseURL: authBaseUrl,
            method: "POST",
            body: {
                username: username,
                password: password,
            },
        }).catch((error: FetchError) => {
            consola.error(new Error(`${error}. ${error.data.errorMessage}`));
            return null;
        });

        return response;
    }

    /**
     * The request allows you to invalidate the accessToken. In case the passed token cannot be found in the token store, no error will be generated and you will receive a successful response. {@link https://docs.ely.by/en/minecraft-auth.html#id3|Read more here}.
     *
     * A successful response will be an empty body.
     * @param {string} accessToken The access token received after authentication.
     * @param {string} clientToken The unique identifier of the client with respect to which the accessToken was received.
     */
    public async invalidate(accessToken: string, clientToken: string) {
        const response = await ofetch("/auth/invalidate", {
            baseURL: authBaseUrl,
            method: "POST",
            body: {
                accessToken: accessToken,
                clientToken: clientToken,
            },
        }).catch((error: FetchError) => {
            consola.error(new Error(`${error}. ${error.data.errorMessage}`));
            return null;
        });

        return response;
    }
}
