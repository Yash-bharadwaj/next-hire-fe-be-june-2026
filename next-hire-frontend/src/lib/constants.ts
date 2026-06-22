// Default page size used for initial pagination state and list requests
// that don't specify an explicit limit.
export const DEFAULT_PAGE_SIZE = 10;

// Backend's maximum page size, used by call sites that need to fetch a
// full list in one request (e.g. populating a dropdown of all jobs).
export const MAX_PAGE_SIZE = 100;
