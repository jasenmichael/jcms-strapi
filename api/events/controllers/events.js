const fetch = require("node-fetch");

module.exports = {
  // GET /events
  // use queries from eventbrite api
  // example for pagination --- /events?page_size=2&page=4
  find: async (ctx) => {
    const query = ctx.request.url.includes("?")
      ? "?" + ctx.request.url.split("?")[1]
      : "";
    console.log({ query });
    const orgId = process.env.EVENTBRITE_ORG_ID;
    await fetch(
      `https://www.eventbriteapi.com/v3/organizations/${orgId}/events${query}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.EVENTBRITE_SECRET}` },
        redirect: "follow",
      }
    )
      .then((response) => response.text())
      .then((res) => ctx.send(JSON.parse(res)))
      .catch((error) => ctx.send({ error: JSON.parse(error) }));
  },
};
