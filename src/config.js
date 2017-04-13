const config = {
  'port': process.env.PORT || 5000,
  'awsRegion': process.env.AWS_REGION || 'eu-central-1',
  'awsS3Bucket': process.env.AWS_S3_BUCKET || 'redirectpro-development',
  'dynamodbPrefix': process.env.DYNAMODB_PREFIX || 'rp_dev_',
  'loggerLevel': process.env.LOGGER_LEVEL || 'verbose'
}

export default config
