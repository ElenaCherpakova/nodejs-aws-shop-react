import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class CdkDeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cloudFrontOAI = new cloudfront.OriginAccessIdentity(this, 'JSCC-OAI');

    const siteBucket = new s3.Bucket(this, 'MyStaticBucket', {
      bucketName: 'elena-my-shop-s3',
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    siteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [siteBucket.arnForObjects('*')],
        principals: [
          new iam.CanonicalUserPrincipal(
            cloudFrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      'MyStatic-distribution',
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: siteBucket,
              originAccessIdentity: cloudFrontOAI,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    );
    new s3deploy.BucketDeployment(this, 'MyBucket-Deployment', {
      sources: [s3deploy.Source.asset(path.resolve(__dirname, '../../dist'))],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });
    new cdk.CfnOutput(this, 'DistributionURL', {
      value: distribution.distributionDomainName,
      description: 'URL of the CloudFront distribution',
    });

    new cdk.CfnOutput(this, 'MyBucketURL', {
      value: siteBucket.bucketWebsiteUrl,
      description: 'URL of the s3 bucket',
    })
  }
}
