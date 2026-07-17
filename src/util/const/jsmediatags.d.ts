// types/jsmediatags.d.ts
// no official @types package exists for jsmediatags — minimal shape for what we actually use
declare module 'jsmediatags' {
  type Picture = {
    format?: string;          // e.g. "image/jpeg", "image/png" — sometimes omitted for MP4 covers
    data: number[];           // raw image bytes as a plain array (not Uint8Array)
    description?: string;
  };
  type Tag = {
    tags: {
      title?: string;
      artist?: string;
      album?: string;
      picture?: Picture;
      [key: string]: any;
    };
  };
  type ReadCallbacks = {
    onSuccess: (tag: Tag) => void;
    onError: (error: any) => void;
  };
  const jsmediatags: {
    read: (path: string, callbacks: ReadCallbacks) => void;
    Config: any;
  };
  export default jsmediatags;
}