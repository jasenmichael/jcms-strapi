module.exports = ({ env }) => ({
    upload: {
      provider: 'dropbox',
      providerOptions: {
        accessToken: env('DROPBOX_TOKEN'),
      },
    },
  });