import { Construct } from "constructs";
import { certificate, personalStackRouteZone } from "../cdk";
import { BlockPublicAccess, Bucket, BucketAccessControl } from "aws-cdk-lib/aws-s3";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { AllowedMethods, Distribution, SecurityPolicyProtocol, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { DOMAIN_NAME, WEBSITE_DOMAIN_NAME } from "../stack-config";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";

export function generateWebsiteConstruct(parent: Construct) {
    const construct = new Construct(parent, 'WebsiteConstruct')

    const bucket = new Bucket(construct, 'Bucket', {
        bucketName: `${DOMAIN_NAME}-bucket`,
        publicReadAccess: true,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
        accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
        websiteIndexDocument: 'index.html',
        websiteErrorDocument: 'error/index.html'
    })
    
    const distribution = new Distribution(construct, 'Distribution', {
        certificate,
        defaultRootObject: 'index.html',
        domainNames: [DOMAIN_NAME, WEBSITE_DOMAIN_NAME ],
        minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_1_2016,
        errorResponses: [
            {
            httpStatus: 404,
            responseHttpStatus: 404,
            responsePagePath: '/error/index.html',
            ttl: Duration.minutes(30),
            }
        ],
        defaultBehavior: {
            origin: new S3Origin(bucket),
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        }
    });

    // === Loads site into bucket with a reference to the distrubution to invalidate cache ===
    new BucketDeployment(construct, 'BucketDeploy', {
        sources: [Source.asset('../astro/dist')],
        destinationBucket: bucket,
        distribution,
    });
    
    // === Registering Website Cloudfront to DNS Domains. ===
    new ARecord(construct, 'AliasRecordRoot', {
            zone: personalStackRouteZone,
            recordName: DOMAIN_NAME,
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution))
    });
    new ARecord(construct, 'AliasRecordWWW', {
        zone: personalStackRouteZone,
        recordName: WEBSITE_DOMAIN_NAME,
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution))
    });

    return {
        construct,
        distribution,
        bucket
    }
}
