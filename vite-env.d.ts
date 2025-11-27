// This file previously contained a reference to "vite/client" which caused type definition errors.
// Since we are now using process.env.API_KEY, the import.meta.env definitions are no longer strictly required here.
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
