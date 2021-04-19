import * as cdk from '@aws-cdk/core';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import * as path from 'path';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';

export class BackEndServerStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const asset = new DockerImageAsset(this, 'MyBuildImage', {
            directory: path.join(__dirname, '..')
        });

        const vpc = new ec2.Vpc(this, "MyVpc", {
            maxAzs: 3
        });
      
        const cluster = new ecs.Cluster(this, "MyCluster", {
            vpc: vpc
        });

        cluster.addCapacity('defaultCapacity', {
            instanceType: new ec2.InstanceType('t2.medium'),
            desiredCapacity: 1
        });
          
        const loadBalancedEcsService = new ecsPatterns.ApplicationLoadBalancedEc2Service(this, 'DrawECSService', {
            memoryLimitMiB: 4096,
            cluster: cluster,
            taskImageOptions: {
              image: ecs.ContainerImage.fromDockerImageAsset(asset),
            },
            cpu: 2024,
            publicLoadBalancer: true,
            desiredCount: 1,
            minHealthyPercent: 0
        });
    }
}
