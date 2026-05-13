exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  const slug = event.queryStringParameters?.slug;
  const query = event.queryStringParameters?.query;

  try {
    let url;
    if (slug) {
      url = `https://gamma-api.polymarket.com/events?slug=${slug}&limit=1`;
    } else if (query) {
      url = `https://gamma-api.polymarket.com/events?title=${encodeURIComponent(query)}&limit=5&active=true`;
    } else {
      url = `https://gamma-api.polymarket.com/events?active=true&limit=10&order=volume&ascending=false`;
    }

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }
  } catch (_) {}

  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({ error: "Failed to fetch market" })
  };
};
