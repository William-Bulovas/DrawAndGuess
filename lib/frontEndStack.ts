import { CloudFrontWebDistribution, Distribution } from '@aws-cdk/aws-cloudfront';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';

export class FrontEndStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const frontEndBucket = new Bucket(this, 'DrawBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    });    

    const distribution = new CloudFrontWebDistribution(this, 'drawDistribution', {
      originConfigs: [
        {
            s3OriginSource: {
                s3BucketSource: frontEndBucket
            },
            behaviors : [ {isDefaultBehavior: true}],
        }
      ],
      errorConfigurations: [
        {
          errorCode: 403,
          responseCode: 200,
          responsePagePath: '/index.html'
        }
      ]
    });

    new BucketDeployment(this, 'DrawGuessDistribution', {
      sources: [ Source.asset('./__sapper__/export') ],
      destinationBucket: frontEndBucket,
      distribution
    });
  }
}
