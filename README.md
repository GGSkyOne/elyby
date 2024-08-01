# Ely.by API

Provide a type-safe and documented implementation of Ely.by API described in [official documentation](https://docs.ely.by/en/index.html).

## Important notice

It is not an official package and it is not supported by Ely.by in any way. If you want to contribute you can open a issue or pull request in project GitHub. Strongly recommended to read [official documentation](https://docs.ely.by/en/api.html]) before working with this package.

## Roadmap

-   [ ] Write tests
-   [ ] Improve existing methods
-   [ ] Maybe add some methods for skins

## Install

```
npm install elyby
pnpm add elyby
yarn add elyby
bun add elyby
```

## Usage

You can use this package to use for:

-   [Authentication for Minecraft and launcher](#authentication-for-minecraft-and-launcher)
-   [Authorization via OAuth2 protocol](#authorization-via-oauth2-protocol)
-   [Set of additional requests implemented based on Ely.by authorization server](#set-of-additional-requests-implemented-based-on-elyby-authorization-server)

## Authentication for Minecraft and launcher

This section describes authentication for the game launcher and describes the steps required to obtain an accessToken for the Minecraft game client. The authentication will result in a JWT token with minecraft_server_session access rights being received.

We recommend [using the OAuth 2.0 authentication protocol](#oauth2) and requesting minecraft_server_session access rights as that is a more secure and user-friendly method.

### Authentification

```ts
import { ElyClient } from "elyby";
const client = new ElyClient("client_token");

const user = await client.authenticate("email", "password", true); // If the parameter is passed as true, the user field will be present in the server response.

console.log(user);
```

### Authentification response

```json
{
    "accessToken": "long_string_that_contains_access_token",
    "clientToken": "passed_in_request_client_token",
    "availableProfiles": [
        {
            "id": "user_UUID_without_hyphen",
            "name": "current_user_username"
        }
    ],
    "selectedProfile": {
        "id": "user_UUID_without_hyphen",
        "name": "current_user_username"
    },
    "user": {
        /* only if requestUser is true */
        "id": "user_UUID_without_hyphen",
        "username": "current_user_username",
        "properties": [
            {
                "name": "preferredLanguage",
                "value": "en"
            }
        ]
    }
}
```

### Token refresh

Updates a valid accessToken. This request allows you to store not the client’s password, but only the saved accessToken value for an almost infinite ability to pass authentication.

The response is the same as authentification response, but availableProfiles is not included.

```ts
import { ElyClient } from "elyby";
const client = new ElyClient("client_token");

const user = await client.refresh("access_token", true); // If the parameter is passed as true, the user field will be present in the server response.

console.log(user);
```

### Validate token

This request allows you to check whether the specified accessToken is valid or not. This request does not update the token or its lifetime, but only makes sure that it is still valid.

```ts
import { ElyClient } from "elyby";
const client = new ElyClient("client_token");

const isTokenValid = await client.validate("access_token");

if (isTokenValid) {
    console.log("token in valid!");
} else {
    console.log("token is not valid :(");
}
```

### Sign out

This request enables the invalidation of all tokens issued to the user.

```ts
import { ElyClient } from "elyby";
const client = new ElyClient("client_token");

await client.signout("username", "password");
```

### Invalidate access token

The request allows you to invalidate the accessToken. In case the passed token cannot be found in the token store, no error will be generated and you will receive a successful response.

```ts
import { ElyClient } from "elyby";
const client = new ElyClient("client_token");

await client.invalidate("access_token", "client_token");
```

## Authorization via OAuth2 protocol

Before using OAuth2 you need to [register your application](https://docs.ely.by/en/oauth.html#id1). After that you get client_id, client_secret and redirect_uri which you will use later!

### Authorization initiation

To initiate the authorization flow, you’ll have to generate the url and redirect the user to it.

```ts
import { ElyOauth } from "elyby";
const oauth = new ElyOauth("client_id", "client_secret", "redirect_uri");

const link = oauth.generateLink(["account_info", "offline_access", "minecraft_server_session"]); // Generate link for user authentification with defined scopes
```

### Exchange auth code for a access token

After successful authorization you will be redirected to your redirect_uri with code, you’ll need to exchange it for an access_token.

```ts
import { ElyOauth } from "elyby";
const oauth = new ElyOauth("client_id", "client_secret", "redirect_uri");

const tokens = await oauth.exchangeCode("authorization_code"); // Keep in mind that refresh_token returns only if `offline_access` scope is presented.

console.log(tokens);
```

### Code exchange response

```json
{
    "access_token": "4qlktsEiwgspKEAotazem0APA99Ee7E6jNryVBrZ",
    "refresh_token": "m0APA99Ee7E6jNryVBrZ4qlktsEiwgspKEAotaze", // returns only if `offline_access` scope is presented.
    "token_type": "Bearer",
    "expires_in": 86400 // Number of seconds for which the token was issued.
}
```

### Getting user information

If the received token has the account_info scope, then you can request information about the user’s account. To do it, you have to send a request to the URL.

```ts
import { ElyOauth } from "elyby";
const oauth = new ElyOauth("client_id", "client_secret", "redirect_uri");

const user = await oauth.fetchAccount("access_token");

console.log(user);
```

### Account response

```json
{
    "id": 1,
    "uuid": "ffc8fdc9-5824-509e-8a57-c99b940fb996",
    "username": "ErickSkrauch",
    "registeredAt": 1470566470,
    "profileLink": "http://ely.by/u1",
    "preferredLanguage": "be",
    "email": "erickskrauch@ely.by" // Note that the email field will only be present when the account_email scope has been requested.
}
```

### Refreshing access token

If you have requested the scope offline_access during authorization, then along with your access_token you’ll also get refresh_token. This token doesn’t expire and can be used to obtain a new access token when that one expires.

The response will have exactly the same body as the result of exchanging auto code for an access token, but refresh_token field will be absent.

```ts
import { ElyOauth } from "elyby";
const oauth = new ElyOauth("client_id", "client_secret", "redirect_uri");

const newTokens = await oauth.refreshToken("refresh_token");

console.log(newTokens);
```

## Set of additional requests implemented based on Ely.by authorization server

### Using contsructor

You can use class contructor to avoid passing values in each method. Works with every method.

```ts
import { ElyApi } from "elyby";
const api = new ElyApi("ErickSkrauch", "ffc8fdc95824509e8a57c99b940fb996");

const profile = await api.profileByUuid(); // we are not passing values here.

console.log(profile);
```

### UUID by username

This method allows you to find out the UUID of a user by their username.

When the passed username isn’t found, you will receive a response with 204 status code and an empty body.

```ts
import { ElyApi } from "elyby";
const api = new ElyApi();

const profile = await api.uuidByUsername("ErickSkrauch");

console.log(profile);
```

### UUID by username response

```json
{
    "id": "ffc8fdc95824509e8a57c99b940fb996",
    "name": "ErickSkrauch"
}
```

### Username by UUID + history of changes

This method allows you to find out all usernames used by a user by their UUID.

When the passed UUID isn’t found, you will receive a response with 204 status code and an empty body.

```ts
import { ElyApi } from "elyby";
const api = new ElyApi();

const changes = await api.usernameHistoryByUuid("ffc8fdc95824509e8a57c99b940fb996");

for (const change of changes) {
    console.log(change);
}
```

### Username by UUID response

```json
[
    {
        "name": "Admin"
    },
    {
        "name": "ErickSkrauch",
        "changedToAt": 1440707723000
    }
]
```

### Usernames list to their UUIDs

This method allows you to query a list of users’ UUIDs by their usernames.

The array must contain no more than 100 usernames, otherwise IllegalArgumentException will be returned with the message "Not more than that 100 profile names per call is allowed.". In case the passed string is an invalid JSON object, the same exception will be returned, but with the text "Passed array of profile names is an invalid JSON string.".

If one of the passed usernames isn’t found in the database, no value will be returned for it (it will be skipped). Keep this in mind when parsing the response.

```ts
import { ElyApi } from "elyby";
const api = new ElyApi();

const profiles = await api.usernamesToUuids(["ErickSkrauch", "EnoTiK", "KmotherfuckerF"]);

for (const profile of profiles) {
    console.log(profile);
}
```

### Usernames list to their UUIDs response

```json
[
    {
        "id": "ffc8fdc95824509e8a57c99b940fb996",
        "name": "ErickSkrauch"
    },
    {
        "id": "b8407ae8218658ef96bb0cb3813acdfd",
        "name": "EnoTiK"
    },
    {
        "id": "39f42ba723de56d98867eabafc5e8e91",
        "name": "KmotherfuckerF"
    }
]
```

### Profile info by UUID

This method allows you to get user profile by UUID.

```ts
import { ElyApi } from "elyby";
const api = new ElyApi();

const profile = await api.profileByUuid("ffc8fdc95824509e8a57c99b940fb996");

console.log(profile);
```

### Profile info by UUID response

```json
{
    "id": "ffc8fdc95824509e8a57c99b940fb996",
    "name": "ErickSkrauch",
    "properties": [
        {
            "name": "textures",
            "value": "eyJ0aW1lc3RhbXAiOjE2MTQ5MzczMjc0MzcsInByb2ZpbGVJZCI6ImZmYzhmZGM5NTgyNDUwOWU4YTU3Yzk5Yjk0MGZiOTk2IiwicHJvZmlsZU5hbWUiOiJFcmlja1NrcmF1Y2giLCJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly9lbHkuYnkvc3RvcmFnZS9za2lucy82OWM2NzQwZDI5OTNlNWQ2ZjZhN2ZjOTI0MjBlZmMyOS5wbmcifX19"
        },
        {
            "name": "ely",
            "value": "but why are you asking?"
        }
    ]
}
```

## Author

Github: [@GGSkyOne](https://github.com/GGSkyOne)

## Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/GGSkyOne/elyby/issues) and [pull requests](https://github.com/GGSkyOne/elyby/pulls).

## Show your support

Give a ⭐️ if this project helped you!

## License

Copyright © 2024 GGSkyOne.
This project is MIT licensed.
