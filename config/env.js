const { cleanEnv, str, num } = require('envalid');

const env = cleanEnv(process.env, {
    MONGO_URI: str(),
    PORT: num({ default: 5000 }),
    JWT_SECRET: str(),
    AWS_ACCESS_KEY_ID: str(),
    AWS_SECRET_ACCESS_KEY: str(),
    AWS_REGION: str(),
    S3_BUCKET_NAME: str(),
    JWT_EXPIRATION: str()
});

module.exports = env;