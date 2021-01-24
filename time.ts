/**
 * Returns the current local Unix time
 * @param offset - This many seconds will be added to the returned time
 */
export function getLocalUnixTime(offset?: number): number {
  return Math.floor(Date.now() / 1000) + (offset || 0);
}

/**
 * Returns offset between you and steam servers in seconds
 * 
 * Offset will be fetched from: https://api.steampowered.com/ITwoFactorService/QueryTime/v1/
 */
export async function getTimeOffset(): Promise<number> {
  const response = await fetch(
    "https://api.steampowered.com/ITwoFactorService/QueryTime/v1/",
    {
      method: "POST",
      headers: {
        "Content-Length": "0",
      },
    },
  )
    .then((res) => res.json())
    .then((res) => res.response);

  if (!response || !response.server_time) {
    throw new Error("Malformed response");
  }

  const offset = response.server_time - getLocalUnixTime();

  return offset;
}
