# deno-steam-totp

This is a deno version of [node-steam-totp by DoctorMcKay](https://github.com/DoctorMcKay/node-steam-totp)

It's a port of his module, just a little bit different.

## usage

```js
import * as SteamTotp from 'https://deno.land/x/steamtotp@v2.1.0';
```

## generateAuthCode( secret: string | Buffer, timeOffset?: number): string

Generate a Steam-style TOTP authentication code.

## generateConfirmationCode (identitySecret: Buffer | string, options: Options): string

Generate a base64 confirmation key for use with mobile trade confirmations. The code can only be used once.

### options

```ts
options?: {
    time?: number;
    tag?: "conf" | "details" | "allow" | "cancel";
}
```

## getDeviceID(steamID: string | object, salt?: string): string

Get a standardized device ID based on your SteamID.

### steamID - Your SteamID, either as a string or as an object which has a toString() method that returns the SteamID

`STEAM_TOTP_SALT` is not supported.

The algorithm used is:

1. Convert the SteamID to a string
2. Append the value of the `salt` param to the SteamID, If It's set
3. SHA-1 hash it and encode the resulting hash as a lowercase hex value
4. Truncate the hash to 32 characters
5. Insert dashes such that the resulting value has 5 groups of hexadecimal values containing 8, 4, 4, 4, and 12 characters, respectively
6. Prepend "android:" to the resulting value

## getLocalUnixTime(offset = 0): number

Returns the current local Unix time

## getTimeOffset(): Promise&lt;number&gt;

Returns offset between you and steam servers in seconds
