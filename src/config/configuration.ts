export default () => ({
  port: parseInt(process.env.PORT) || 8080,
  SSO_API_URL: process.env.SSO_API_URL || '',
  CORS_ORIGIN:
    process.env.NODE_ENV === 'dev'
      ? [
          /https?:\/\/(([^/]+\.)?trueprofile\.io)$/i,
          /http:\/\/localhost:[0-9]+/i,
        ]
      : [/https?:\/\/(([^/]+\.)?trueprofile\.io)$/i],
});
