import { Buffer, HmacSha1, Sha1 } from "./deps.ts";
import { getLocalUnixTime, getTimeOffset } from "./time.ts";

/**
 * Generate a Steam-style TOTP authentication code.
 * @param sharedSecret - Your TOTP shared_secret as a Buffer, hex, or base64
 * @param timeOffset - If you know how far off your clock is from the Steam servers, put the offset here in seconds.
 */
function generateAuthCode(
  sharedSecret: string | Buffer,
  timeOffset?: number,
): string {
  const secretBuffer = bufferizeSecret(sharedSecret);

  const offsetedLocalUnixTime = getLocalUnixTime(timeOffset || 0);

  const timeBuffer = Buffer.allocUnsafe(8);
  timeBuffer.writeUInt32BE(0, 0);
  timeBuffer.writeUInt32BE(Math.floor(offsetedLocalUnixTime / 30), 4);

  let hmac = Buffer.from(
    new HmacSha1(secretBuffer).update(timeBuffer).digest(),
  );

  const start = hmac[19] & 0x0F;
  hmac = hmac.slice(start, start + 4);

  let fullcode = hmac.readUInt32BE(0) & 0x7FFFFFFF;

  const chars = "23456789BCDFGHJKMNPQRTVWXY";

  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(fullcode % chars.length);
    fullcode /= chars.length;
  }

  return code;
}

/**
 * Generate a base64 confirmation key for use with mobile trade confirmations. The code can only be used once.
 * @param identitySecret - The identity_secret that you received when enabling two-factor authentication
 * @param  time - The Unix time for which you are generating this secret. Generally should be the current time.
 * @param tag - Default: "conf".
 * The tag which identifies what this request (and therefore key) will be for.
 * "conf" to load the confirmations page.
 * "details" to load details about a trade.
 * "allow" to confirm a trade.
 * "cancel" to cancel it.
 */
function generateConfirmationCode(
  identitySecret: Buffer | string,
  options?: {
    time?: number;
    tag?: "conf" | "details" | "allow" | "cancel";
  },
): string {
  if (!options) {
    options = {};
  }

  const tag = options.tag || "conf";

  const identitySecretBuffer = bufferizeSecret(identitySecret);

  let dataLen = 8;

  if (tag) {
    if (tag.length > 32) {
      dataLen += 32;
    } else {
      dataLen += tag.length;
    }
  }

  // deno-lint-ignore prefer-const
  let paramBuffer = Buffer.allocUnsafe(dataLen);
  paramBuffer.writeUInt32BE(0, 0);
  paramBuffer.writeUInt32BE(
    options.time !== undefined ? options.time : getLocalUnixTime(),
    4,
  );

  if (tag) {
    paramBuffer.write(tag, 8);
  }
  return Buffer.from(
    new HmacSha1(identitySecretBuffer).update(paramBuffer).digest(),
  ).toString("base64");
}

function bufferizeSecret(secret: string | Buffer): Buffer {
  if (typeof secret === "string") {
    // Check if it's hex
    if (secret.match(/[0-9a-f]{40}/i)) {
      return Buffer.from(secret, "hex");
    } else {
      // Looks like it's base64
      return Buffer.from(secret, "base64");
    }
  }
  return secret;
}

/**
 * Get a standardized device ID based on your SteamID.
 * @param steamID - Your SteamID, either as a string or as an object which has a toString() method that returns the SteamID
 */
// deno-lint-ignore ban-types
function getDeviceID(steamID: string | object, salt?: string): string {
  const steamIDString = typeof steamID === "string"
    ? steamID
    : steamID.toString();
  return "android:" +
    new Sha1().update(steamIDString + (salt || "")).hex().replace(
      /^([0-9a-f]{8})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{4})([0-9a-f]{12}).*$/,
      "$1-$2-$3-$4-$5",
    );
}

export {
  generateAuthCode,
  generateConfirmationCode,
  getDeviceID,
  getLocalUnixTime,
  getTimeOffset,
};

export * from "./time.ts";
