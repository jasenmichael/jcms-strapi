module.exports = ({env}) => {
  const FRONTEND_URL = env("FRONTEND_URL")
  return {
    gzip: {
      enabled: true,
      options: {
        br: false,
      },
    },
    settings: {
      parser: {
        enabled: true,
        multipart: true,
        formidable: {
          maxFileSize: 200 * 1024 * 1024, // Defaults to 200mb
        },
        cors: {
          origin: ["*"], //allow all
          // origin: [
          //   "http://localhost:3000",
          //   "https://mysite.com",
          //   "https://www.mysite.com",
          // ],
        },
      },
      poweredBy: {
        enabled: true,
        value: "JCMS",
      },
      xframe: {
        enabled: true,
        value: `ALLOW-FROM ${FRONTEND_URL}`,
      },
      headers: [
        "Content-Type",
        "Authorization",
        "X-Frame-Options",
        `Content-Security-Policy: frame-ancestors ${FRONTEND_URL}`,
      ],
    },
  };
};
