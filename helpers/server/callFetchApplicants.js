export default async function callFetchApplicants(pathname, method, body) {
  try {
    const accountsBaseService = JSON.parse(
      process.env.NEXT_PUBLIC_BUSINESS_INTERNAL_BASE_SERVICE
    );
    const response = await fetch(`${accountsBaseService.url_two}${pathname}`, {
      method,
      headers: {
        ...(method === "GET" ? {} : { "Content-Type": "application/json" }),
        ...accountsBaseService.headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    return [response.status, await response.json()];
  } catch (err) {
    throw new Error("Fetch Error");
  }
}
