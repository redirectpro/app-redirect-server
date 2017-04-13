#!/bin/bash
pip install awsebcli
aws configure set region $DEPLOY_AWS_REGION
mkdir .elasticbeanstalk
echo 'branch-defaults:
  master:
    environment: null
global:
  application_name: '$EB_APPLICATION_NAME'
  branch: null
  default_ec2_keyname: null
  default_platform: node.js
  default_region: '$DEPLOY_AWS_REGION'
  instance_profile: null
  platform_name: null
  platform_version: null
  profile: null
  repository: null
  sc: git
  workspace_type: Application' > .elasticbeanstalk/config.yml
eb deploy $EB_ENVIRONMENT_NAME
