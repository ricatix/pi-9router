export async function detectWebEndpoint(baseUrl: string, apiKey: string): Promise<string | null> { return `${baseUrl}/web`; }
export async function webFetch(baseUrl: string, apiKey: string, query: string): Promise<string> { return `web unavailable for ${query}`; }
export async function webSearch(baseUrl: string, apiKey: string, query: string): Promise<string> { return `search unavailable for ${query}`; }
