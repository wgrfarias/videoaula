import * as tus from "tus-js-client";

export type BunnyTusParams = {
  endpoint: string;
  libraryId: string;
  videoId: string;
  authorizationSignature: string;
  authorizationExpire: number;
};

// Bunny's TUS endpoint expects the auth fields as base64 TUS metadata (not
// custom headers) on the upload — tus-js-client's `metadata` option handles
// the encoding. Implemented from documented Bunny Stream + tus-js-client
// integration guides; if uploads start failing with 401s, re-check these
// field names against https://docs.bunny.net (this sandbox couldn't reach
// that host to verify live).
export function uploadToBunny(
  file: File,
  params: BunnyTusParams,
  onProgress?: (percent: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: params.endpoint,
      retryDelays: [0, 1000, 3000, 5000],
      metadata: {
        filetype: file.type,
        title: file.name,
        AuthorizationSignature: params.authorizationSignature,
        AuthorizationExpire: String(params.authorizationExpire),
        VideoId: params.videoId,
        LibraryId: params.libraryId,
      },
      onError: (error) => reject(error),
      onProgress: (bytesUploaded, bytesTotal) => {
        onProgress?.(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess: () => resolve(),
    });
    upload.start();
  });
}
