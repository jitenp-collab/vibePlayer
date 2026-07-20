const ENDPOINTS = [
  'https://www.google.com/generate_204',
  'https://www.gstatic.com/generate_204',
  'https://cloudflare.com/cdn-cgi/trace',
];

const tryFetch = async (url: string, timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    clearTimeout(timeout);
    return response.status >= 200 && response.status < 400;
  } catch (error) {
    clearTimeout(timeout);
    return false;
  }
};

export const checkInternet = async (timeoutMs = 5000) => {
  const results = await Promise.all(
    ENDPOINTS.map(url => tryFetch(url, timeoutMs)),
  );
  const online = results.some(Boolean);
  return online;
};