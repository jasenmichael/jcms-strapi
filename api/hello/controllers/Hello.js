module.exports = {
  // GET /hello
  index: async (ctx) => {
    ctx.send({ msg: ctx });
  },
};
