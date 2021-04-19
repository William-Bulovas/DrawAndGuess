import * as cdk from '@aws-cdk/core';
import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2';
import { LambdaWebSocketIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as path from 'path';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';

export class BackEndStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'drawTable', {
        partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
        sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
        tableName: 'DrawTable',
        removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const connectionFn = new NodejsFunction(this, 'drawConnectFn', {
        entry: path.join(__dirname, '../src/lambda/onConnect.ts'),
        handler: 'handler'
      });
    const disconnectionFn = new NodejsFunction(this, 'drawDisconnectFn', {
        entry: path.join(__dirname, '../src/lambda/onDisconnect.ts'),
        handler: 'handler'
    });
    const defaultMessageFn = new NodejsFunction(this, 'drawMessageFn', {
        entry: path.join(__dirname, '../src/lambda/onMessage.ts'),
        handler: 'handler',
        bundling: {
            loader: {
                '.node': 'base64'
            },
            sourceMap: true
        },
        environment: {
          NODE_OPTIONS: '--enable-source-maps'
        }
    });

    table.grantReadWriteData(defaultMessageFn);

    const webSocketApi = new WebSocketApi(this, 'drawWebSocketApi', {
        connectRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: connectionFn})},
        disconnectRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: disconnectionFn})},
        defaultRouteOptions: { integration: new LambdaWebSocketIntegration({ handler: defaultMessageFn})},
    });

    new WebSocketStage(this, 'drawWebSocketApiStage', {
        webSocketApi,
        stageName: 'dev',
        autoDeploy: true,
    });
  }
}
