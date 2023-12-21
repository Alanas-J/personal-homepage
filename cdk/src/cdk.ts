#!/usr/bin/env node
import { App, Stack } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { PublicHostedZone} from 'aws-cdk-lib/aws-route53';
import { DOMAIN_NAME } from './stack-config';
import { generateWebsiteConstruct } from './website-construct/website-construct';

const cdkApp = new App()
export const personalStack = new Stack(cdkApp, 'PersonalStack', {
    description: 'My own personal stack to make the most of AWS Free-tier.'
})

export const personalStackRouteZone = new PublicHostedZone(personalStack, 'PersonalStackRouteZone', {
    zoneName: DOMAIN_NAME
})
// === Manually Created Cert (has to be in us-east) ====
export const certificate = Certificate.fromCertificateArn(personalStack, 'PersonalCert',
    'arn:aws:acm:us-east-1:736584645105:certificate/eece2c58-ea85-4cfa-a0a5-e123bf7390c0'
)

generateWebsiteConstruct(personalStack)
