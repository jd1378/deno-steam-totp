/**
 * Returns the current local Unix time
 * @param timeOffset - This many seconds will be added to the returned time
 */
export function getLocalUnixTime(timeOffset?: number) {
  return Math.floor(Date.now() / 1000) + (timeOffset || 0);
}

/**
 * offset will be fetched from: https://api.steampowered.com/ITwoFactorService/QueryTime/v1/
 * 
 * returns offset in seconds
 */
export async function getTimeOffset() {
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
