import crypto from "node:crypto";

export const bunnyEnabled = Boolean(process.env.BUNNY_LIBRARY_ID && process.env.BUNNY_API_KEY);

const BUNNY_API_HOST = "https://video.bunnycdn.com";
export const BUNNY_TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload";

function requireBunnyEnv() {
  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const apiKey = process.env.BUNNY_API_KEY;
  if (!libraryId || !apiKey) {
    throw new Error("Bunny.net não está configurado (BUNNY_LIBRARY_ID / BUNNY_API_KEY ausentes)");
  }
  return { libraryId, apiKey };
}

// Registers a new video placeholder in the Bunny Stream library; the actual
// file bytes go straight from the browser to Bunny via the TUS endpoint
// below, never through our server.
export async function createBunnyVideo(title: string) {
  const { libraryId, apiKey } = requireBunnyEnv();

  const res = await fetch(`${BUNNY_API_HOST}/library/${libraryId}/videos`, {
    method: "POST",
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao criar vídeo no Bunny.net (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { guid: string };
  return data.guid;
}

// TUS resumable-upload auth: Bunny expects an AuthorizationSignature
// (sha256 of libraryId + apiKey + expiration + videoId), an expiration unix
// timestamp, the library id and the video id, sent as base64 TUS metadata
// by the client (tus-js-client's `metadata` option handles the encoding).
export function getBunnyTusUploadParams(videoGuid: string) {
  const { libraryId, apiKey } = requireBunnyEnv();
  const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1h to complete the upload
  const signature = crypto
    .createHash("sha256")
    .update(`${libraryId}${apiKey}${expirationTime}${videoGuid}`)
    .digest("hex");

  return {
    endpoint: BUNNY_TUS_ENDPOINT,
    libraryId,
    videoId: videoGuid,
    authorizationSignature: signature,
    authorizationExpire: expirationTime,
  };
}

export function bunnyEmbedUrl(videoGuid: string) {
  const { libraryId } = requireBunnyEnv();
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoGuid}`;
}
