const config = {
  'port': process.env.PORT || 5000,
  'awsRegion': process.env.AWS_REGION || 'eu-central-1',
  'awsS3Bucket': 'redirectpro-development' || process.env.AWS_S3_BUCKET,
  'dynamodbPrefix': 'rp_dev_' || process.env.DYNAMODB_PREFIX,
  'loggerLevel': process.env.LOGGER_LEVEL || 'verbose'
}

export default config
