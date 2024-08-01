import { FetchError, ofetch } from "ofetch";
import { consola } from "consola";

const accountApiBaseUrl = "https://account.ely.by/api/account/v1/";
const oauthApiBaseUrl = "https://account.ely.by/api/oauth2/v1";
const oauthBaseUrl = "https://account.ely.by/oauth2/v1";

/**
 * Contains methods useful for performing authorization via OAuth2 protocol.
 * @class
 */
export default class ElyOauth {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;

    constructor(clientId: string, clientSecret: string, redirectUri: string) {
        try {
            if (!clientId) throw new Error("Required parameter is missing: clientID");
            if (!clientSecret) throw new Error("Required parameter is missing: clientSecret");
            if (!redirectUri) throw new Error("Required parameter is missing: redirectUri");
        } catch (error) {
            consola.error(error);
        }

        this.clientSecret = clientSecret;
        this.clientId = clientId;
        this.redirectUri = redirectUri;
    }

    /**
     * Generates link for authorization via OAuth2 protocol. {@link https://docs.ely.by/en/oauth.html#id3|Read more here}.
     * @param {ElyOauthScope[]} scope Required. The array of permissions that you want to access. See all available permissions in {@link https://docs.ely.by/en/oauth.html#available-scopes|this section}.
     * @param {string} state Randomly generated string. Used as a session identifier to increase security. Will be returned unchanged after authorization is completed.
     * @param {string} description If your application is available in several languages, you can use this field to override the default description in accordance with user’s preferred language.
     * @param {ElyOauthPromt} prompt Forcibly display the request for permissions (consent) or forcibly request an account selection (select_account).
     * @param {string} loginHint If a user has several accounts, then specifying username or user email in this parameter will automatically select corresponding account. This is useful in a case of re-login after the token has expired.
     */
    public generateLink(
        scope: ElyOauthScope[],
        state?: string,
        description?: string,
        prompt?: ElyOauthPrompt,
        loginHint?: string,
    ) {
        try {
            if (!scope) throw new Error("Required parameter is missing: scope");
        } catch (error) {
            consola.warn(error);
        }

        const link = new URL(oauthBaseUrl);
        link.searchParams.append("client_id", this.clientId);
        link.searchParams.append("redirect_uri", this.redirectUri);
        link.searchParams.append("response_type", "code");
        if (scope) link.searchParams.append("scope", scope.join(" "));
        if (state) link.searchParams.append("state", state);
        if (description) link.searchParams.append("description", description);
        if (prompt) link.searchParams.append("prompt", prompt);
        if (loginHint) link.searchParams.append("login_hint", loginHint);

        return link.href;
    }

    /**
     * Exchanges authorization code for access and refresh tokens. Refresh token presented only if a initial OAuth request has offline_access scope. {@link https://docs.ely.by/en/oauth.html#authorization-code-grant|Read more here}.
     * @param {string} code Authorization code received in GET params after successful redirect.
     */
    public async exchangeCode(code: string) {
        const tokens = await ofetch<ElyOauthExchangeCodeResponse>("/token", {
            baseURL: oauthApiBaseUrl,
            method: "POST",
            body: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                grant_type: "authorization_code",
                code: code,
            },
        }).catch((error: FetchError) => {
            consola.error(new Error(`${error}. ${error.data.message}`));
            return null;
        });

        return tokens;
    }

    /**
     * If the received token has the account_info scope, then you can request information about the user’s account using this method. {@link https://docs.ely.by/en/oauth.html#id8|Read more here}.
     * @param {string} accessToken Access token exchanged from authorization code.
     */
    public async fetchAccount(accessToken: string) {
        const account = await ofetch<ElyOauthAccountResponse>("/info", {
            baseURL: accountApiBaseUrl,
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        }).catch((error: FetchError) => {
            consola.error(new Error(`${error}. ${error.data.message}.`));
            return null;
        });

        return account;
    }

    /**
     * If you have requested the scope offline_access during authorization, then along with your access_token you’ll also get refresh_token. This token doesn’t expire and can be used to obtain a new access token when that one expires. {@link https://docs.ely.by/en/oauth.html#refresh-token-grant|Read more here}.
     * @param {string} refreshToken Refresh token exchanged from authorization code.
     */
    public async refreshToken(refreshToken: string) {
        const tokens = await ofetch<ElyOauthRefreshTokenResponse>("/token", {
            baseURL: oauthApiBaseUrl,
            method: "POST",
            body: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            },
        }).catch((error: FetchError) => {
            consola.error(new Error(`${error}. ${error.data.message}.`));
            return null;
        });

        return tokens;
    }
}
