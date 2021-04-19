#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { FrontEndStack } from '../lib/frontEndStack';
import { BackEndStack } from '../lib/backEndStack';
import { BackEndServerStack } from '../lib/backEndServerStack';

const app = new cdk.App();
new FrontEndStack(app, 'DrawStack');
new BackEndStack(app, 'DrawBackendStack');
new BackEndServerStack(app, 'DrawBackendServerStack');

