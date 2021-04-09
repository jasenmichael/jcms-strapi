module.exports = ({ env }) => ({
    upload: {
      provider: 'dropbox-v2',
      providerOptions: {
        accessToken: env('DROPBOX_TOKEN'),
        defaultUploadDir: "/uploads/"
      },
    },
  });