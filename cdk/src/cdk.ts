#!/usr/bin/env node
import { App, RemovalPolicy, Duration, Stack, CfnOutput  } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { AllowedMethods, Distribution, SecurityPolicyProtocol, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, PublicHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { DOMAIN_NAME } from './stack-config';

const app = new App();
const personalSiteStack = new Stack(app, 'PersonalSiteStack')

// Cert + DNS STUFF ===================================================================
// const zone = HostedZone.fromLookup(personalSiteStack, 'PersonalSiteZone', { domainName: DOMAIN_NAME })
const zone = new PublicHostedZone(personalSiteStack, 'PersonalSiteRouteZone', {
    zoneName: DOMAIN_NAME
})

// I've decided to manually create a cert via AWS Console
/*
const certificate = new Certificate(personalSiteStack, 'PersonalSiteCert', {
    domainName: DOMAIN_NAME,
    subjectAlternativeNames: [`*.${DOMAIN_NAME}`],
    // validation: <--- used to define ownership confirmation method.
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


// Load Site into bucket
new BucketDeployment(personalSiteStack, 'DeployWebsite', {
    sources: [Source.asset('../astro/dist')],
    destinationBucket: siteS3,
});

// =============================== CloudFront
const certificate = Certificate.fromCertificateArn(personalSiteStack, 'PersonalSiteCert',
    'arn:aws:acm:us-east-1:736584645105:certificate/eece2c58-ea85-4cfa-a0a5-e123bf7390c0'
)

const distribution = new Distribution(personalSiteStack, 'PersonalSiteCF', {
    certificate,
    defaultRootObject: 'index.html',
    domainNames: [DOMAIN_NAME],
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
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    }
});

new ARecord(personalSiteStack, 'SiteAliasRecord', {
        zone,
        recordName: DOMAIN_NAME,
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution))
    });