#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { Duration, Stack } from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';

const app = new cdk.App();
const personalSiteStack = new Stack(app, 'PersonalSiteStack')

// ******* Sample Services ***********
const queue = new sqs.Queue(personalSiteStack, 'CdkQueue', {
    visibilityTimeout: Duration.seconds(300)
});
const topic = new sns.Topic(personalSiteStack, 'CdkTopic');
topic.addSubscription(new subs.SqsSubscription(queue));