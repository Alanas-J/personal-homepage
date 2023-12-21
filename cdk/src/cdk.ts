#!/usr/bin/env node
import { App, RemovalPolicy, Duration, Stack, CfnOutput  } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AllowedMethods, Distribution, SecurityPolicyProtocol, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

const app = new App();
const personalSiteStack = new Stack(app, 'PersonalSiteStack')

/*
// Cert + DNS STUFF ===================================================================
const domainName = 'lol'
const zone = HostedZone.fromLookup(personalSiteStack, 'PersonalSiteZone', { domainName })

const certificate = new Certificate(personalSiteStack, 'PersonalSiteCert', {
    domainName,
    subjectAlternativeNames: [`*.${domainName}`],
    // TODO: Return may need more props
})
certificate.applyRemovalPolicy(RemovalPolicy.DESTROY)
*/


// ================================= S3
const siteS3 = new Bucket(personalSiteStack, 'PersonalSiteBucket', {
    bucketName: 'personal-site-bucket-alanas-website',
    publicReadAccess: true,
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
    blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
    accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    websiteIndexDocument: 'index.html',
    websiteErrorDocument: 'error/index.html'
})
// new CfnOutput(personalSiteStack, 'PersonalSiteBucketName', { value: siteS3.bucketName } )


// Load Site into bucket
new BucketDeployment(personalSiteStack, 'DeployWebsite', {
    sources: [Source.asset('../astro/dist')],
    destinationBucket: siteS3,
});

// =============================== CloudFront

const distribution = new Distribution(personalSiteStack, 'PersonalSiteCF', {
    // certificate,
    defaultRootObject: 'index.html',
    // domainNames: [domainName],
    minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_1_2016,
    errorResponses:[
        {
        httpStatus: 404,
        responseHttpStatus: 404,
        responsePagePath: '/error/index.html',
        ttl: Duration.minutes(30),
        }
    ],
    defaultBehavior: {
        origin: new S3Origin(siteS3),
        // compress: true,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    }
});
// new CfnOutput(personalSiteStack, 'PersonalSiteCFId', { value: distribution.distributionId });

/*
// 5. Create a Route 53 alias record for the CloudFront distribution
new ARecord(personalSiteStack, 'SiteAliasRecord', {
        zone,
        recordName: domainName,
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution))
    });
*/