const AWS = require('aws-sdk');
const env = require('../config/env');

AWS.config.update({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
});

const s3 = new AWS.S3();

const s3Upload = async (file) => {
    const params = {
        Bucket: env.S3_BUCKET_NAME,
        Key: `covers/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    return await s3.upload(params).promise();
};

module.exports = s3Upload;