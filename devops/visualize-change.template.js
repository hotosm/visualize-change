const cf = require("@mapbox/cloudfriend");

const Parameters = {
  GitSha: {
    Type: "String"
  },
  ELBSubnets: {
    Description: "ELB subnets",
    Type: "String"
  },
  Environment: {
    AllowedValues: ["production", "staging"],
    Default: "staging",
    Description: "NODE_ENV environment variable",
    Type: "String"
  },
  MailgunAPIKey: {
    Description: "api key for mailgun",
    Type: "String"
  },
  MailginDomain: {
    Description: "domain from mailgun",
    Type: "String"
  },
  MapboxAccessToken: {
    Description: "access token for mapbox",
    Type: "String"
  },
  ServerDomain: {
    Description: "main domain of the server (http://SERVER_DOMAIN/), used for making URL in email",
    Type: "String"
  },
  PostgresPassword: {
    Description: "password to be used for postgres DB",
    Type: "String"
  },
  PostresUser: {
    Description: "user to be used for postgres DB",
    Type: "String"
  },
  MapVectorSourceMaxZoom: {
    Description: "maxzoom value used for vector tile source (should be kept to 12)",
    Type: "String",
    Default: "12"
  },
  MapLayerMinZoom: {
    Description: "minzoom value used for roads and buildings layers. Set to 0 for processed tiles",
    Type: "String",
    Default: "12"
  }
};

const Resources = {
  VisualizeChangeASG: {
    DependsOn: "VisualizeChangeLaunchConfiguration",
    Type: "AWS::AutoScaling::AutoScalingGroup",
    Properties: {
      AutoScalingGroupName: cf.stackName,
      Cooldown: 300,
      MinSize: 1,
      DesiredCapacity: 1,
      MaxSize: 1,
      HealthCheckGracePeriod: 300,
      LaunchConfigurationName: cf.ref("VisualizeChangeLaunchConfiguration"),
      TargetGroupARNs: [cf.ref("VisualizeChangeTargetGroup")],
      HealthCheckType: "EC2",
      AvailabilityZones: cf.getAzs(cf.region)
    }
  },
  VisualizeChangeScaleUp: {
    Type: "AWS::AutoScaling::ScalingPolicy",
    Properties: {
      AutoScalingGroupName: cf.ref("VisualizeChangeASG"),
      PolicyType: "TargetTrackingScaling",
      TargetTrackingConfiguration: {
        TargetValue: 85,
        PredefinedMetricSpecification: {
          PredefinedMetricType: "ASGAverageCPUUtilization"
        }
      },
      Cooldown: 300
    }
  },
  VisualizeChangeLaunchConfiguration: {
    Type: "AWS::AutoScaling::LaunchConfiguration",
    Properties: {
      IamInstanceProfile: cf.ref("VisualizeChangeEC2InstanceProfile"),
      ImageId: "ami-dfca85a0",
      InstanceType: "t2.large",
      BlockDeviceMappings: [
        {
          DeviceName: "/dev/sda1",
          Ebs: { VolumeSize: "150" }
        }
      ],
      SecurityGroups: [
        cf.importValue(
          cf.join("-", ["hotosm-network-production", cf.ref("Environment"), "ec2s-security-group", cf.region])
        )
      ],
      UserData: cf.userData([
        "#!/bin/bash",
        "set -x",
        "curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - ",
        'echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list',
        "sudo apt-get update && sudo apt-get install -y yarn git",
        "https://github.com/hotosm/visualize-change.git /dev/sda1/visualize-change && cd /dev/sda1/visualize-change/ ",
        "git reset --hard ${GitSha}",
        "# ./scripts/get-indonesia-tiles.sh",
        "./scripts/setup-docker-data-folders.sh",
        "if [ ${MAP_LAYER_MINZOOM} == 0 ]; then ./scripts/tiles-add-underzoom.sh; fi",
        "./scripts/build.prod.sh",
        "./scripts/start.prod.sh"
      ]),
      KeyName: "mbtiles"
    }
  },
  VisualizeChangeEC2Role: {
    Type: "AWS::IAM::Role",
    Properties: {
      AssumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: ["ec2.amazonaws.com"]
            },
            Action: ["sts:AssumeRole"]
          }
        ]
      },
      RoleName: cf.join("-", [cf.stackName, "ec2", "role"])
    }
  },
  VisualizeChangeEC2InstanceProfile: {
    Type: "AWS::IAM::InstanceProfile",
    Properties: {
      Roles: [cf.ref("VisualizeChangeEC2Role")],
      InstanceProfileName: cf.join("-", [cf.stackName, "ec2", "instance", "profile"])
    }
  },
  VisualizeChangeLoadBalancer: {
    Type: "AWS::ElasticLoadBalancingV2::LoadBalancer",
    Properties: {
      Name: cf.stackName,
      SecurityGroups: [
        cf.importValue(
          cf.join("-", ["hotosm-network-production", cf.ref("Environment"), "elbs-security-group", cf.region])
        )
      ],
      Subnets: cf.split(",", cf.ref("ELBSubnets")),
      Type: "application"
    }
  },
  VisualizeChangeTargetGroup: {
    Type: "AWS::ElasticLoadBalancingV2::TargetGroup",
    Properties: {
      HealthCheckIntervalSeconds: 60,
      HealthCheckPort: 8000,
      HealthCheckProtocol: "HTTP",
      HealthCheckTimeoutSeconds: 10,
      HealthyThresholdCount: 3,
      UnhealthyThresholdCount: 3,
      Port: 8000,
      Protocol: "HTTP",
      VpcId: cf.importValue(cf.join("-", ["hotosm-network-production", "default-vpc", cf.region])),
      Matcher: {
        HttpCode: "200,202,302,304"
      }
    }
  }
};

module.exports = { Parameters, Resources };
