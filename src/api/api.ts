import { consola } from "consola";
import { FetchError, ofetch } from "ofetch";

const authBaseUrl = "https://authserver.ely.by";

/**
 * Contains methods that interact with set of additional requests implemented based on Ely.by authorization server.
 * @class
 */
export default class ElyApi {
    private username: string = "";
    private uuid: string = "";

    constructor(username?: string, uuid?: string) {
        if (username) this.username = username;
        if (uuid) this.uuid = uuid;
    }

    /**
     * This method allows you to find out the UUID of a user by their username. {@link https://docs.ely.by/en/api.html#uuid|Read more here}.
     *
     * When the passed username isn’t found, you will receive a response with 204 status code and an empty body.
     * @param {string} username Searched username. It can be passed in any case (in the Mojang API, only strict match).
     */
    public async uuidByUsername(username?: string) {
        try {
            if (!username && !this.username) {
                throw new Error("Required parameter is missing: username");
            }
        } catch (error) {
            consola.error(error);
            return null;
        }

        const profile = await ofetch<ElyClientProfile>(`/api/users/profiles/minecraft/${username || this.username}`, {
            baseURL: authBaseUrl,
        }).catch((error: FetchError) => {
            consola.error(new Error(`${error}. ${error.data.errorMessage}`));
            return null;
        });

        return profile;
    }

    /**
     * This method allows you to find out all usernames used by a user by their UUID. {@link https://docs.ely.by/en/api.html#id2|Read more here}.
     *
     * When the passed UUID isn’t found, you will receive a response with 204 status code and an empty body.
     * @param {string} uuid A valid UUID. UUID might be written with or without hyphens. If an invalid string is passed, IllegalArgumentException will be returned with the message "Invalid uuid format".
     */
    public async usernameHistoryByUuid(uuid?: string) {
        try {
            if (!uuid && !this.uuid) {
                throw new Error("Required parameter is missing: uuid");
            }
        } catch (error) {
            consola.error(error);
            return null;
        }

        const history = await ofetch<Array<ElyApiUsernameByUuidProfile>>(
            `api/user/profiles/${uuid || this.uuid}/names`,
            {
                baseURL: authBaseUrl,
            },
        ).catch((error: FetchError) => {
            consola.error(new Error(`${error}. ${error.data.errorMessage}`));
            return null;
        });

        return history;
    }

    /**
     * This method allows you to query a list of users’ UUIDs by their usernames. {@link https://docs.ely.by/en/api.html#id3|Read more here}.
     *
     * If one of the passed usernames isn’t found in the database, no value will be returned for it (it will be skipped). Keep this in mind when parsing the response.
     * @param {string} usernames A valid JSON array of usernames. The array must contain no more than 100 usernames, otherwise IllegalArgumentException will be returned with the message "Not more than that 100 profile names per call is allowed.". In case the passed string is an invalid JSON object, the same exception will be returned, but with the text "Passed array of profile names is an invalid JSON string".
     */
    public async usernamesToUuids(usernames: string[]) {
        const profiles = await ofetch<Array<ElyClientProfile>>("/api/profiles/minecraft", {
            baseURL: authBaseUrl,
            method: "POST",
            body: usernames,
        }).catch((error: FetchError) => {
            consola.error(new Error(`${error}. ${error.data.errorMessage}`));
            return null;
        });

        return profiles;
    }

    /**
     * This method allows you to get user profile by UUID. {@link https://docs.ely.by/en/minecraft-auth.html#id6|Read more here}.
     * @param {string} uuid A valid UUID. UUID might be written with or without hyphens. If an invalid string is passed, IllegalArgumentException will be returned with the message "Invalid uuid format".
     */
    public async profileByUuid(uuid?: string) {
        try {
            if (!uuid && !this.uuid) {
                throw new Error("Required parameter is missing: uuid");
            }
        } catch (error) {
            consola.error(error);
            return null;
        }

        const profile = await ofetch<ElyApiProfileByUuidResponse>(`/session/profile/${uuid || this.uuid}`, {
            baseURL: authBaseUrl,
        }).catch((error: FetchError) => {
            consola.error(new Error(`${error}. ${error.data.errorMessage}`));
            return null;
        });

        return profile;
    }
}
