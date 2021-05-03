module.exports = {
  // GET /wake-up
  status: async (ctx) => {
    ctx.send(true);
  },
};
