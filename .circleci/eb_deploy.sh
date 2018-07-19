#!/usr/bin/env bash
set -xev # halt script on error

# demo and stage branch are set via environment variables in CircleCI
# DEMO_BRANCH="testing branch"
DEV_BRANCH="develop"
PROD_BRANCH="master"

# DEMO_ENV="visualize-change-demo"
DEV_ENV="VisualizeChange-env-1"
PROD_ENV="visualize-change-prod"

echo Running HOT Visualize Change Deployment, current branch is $CIRCLE_BRANCH

# We don't want to deploy Pull Requests only builds on develop and master
# TODO: commenting this out while develop-branch-travis is a PR
# if [[ ! -z $CI_PULL_REQUEST ]]
#     then
#         echo Not Deploying Build $CIRCLE_BUILD_NUM - Branch is $CIRCLE_BRANCH, Is Pull Request is $CI_PULL_REQUESTS
#         return
# fi


# Set Version Number
VERSION=v.0.0.$CIRCLE_BUILD_NUM-$(echo $CIRCLE_BRANCH | tr -cd '[[:alnum:]]._-')

if [[ $CIRCLE_BRANCH =~ ^($DEV_BRANCH|$PROD_BRANCH)$ ]];
  then
    # Install AWS requirements
    pip install awsebcli==3.10.1
    printf '1\nn\n' | eb init visualize-change --region us-east-1
  else
    echo "$CIRCLE_BRANCH does not match"
fi

# Set deployment environment
if [ $CIRCLE_BRANCH == $DEV_BRANCH ]
  then
    DEPLOY_ENV=$DEV_ENV
    DEPLOY_BRANCH=$DEV_BRANCH
elif [ $CIRCLE_BRANCH == $PROD_BRANCH ]
  then
    DEPLOY_ENV=$PROD_ENV
    DEPLOY_BRANCH=$PROD_BRANCH
fi


docker commit $(docker ps -f "ancestor=hot-mapping-vis-frontend-prod" -ql) quay.io/hotosm/hot-mapping-vis-frontend-$DEPLOY_BRANCH
docker commit $(docker ps -f "ancestor=hot-mapping-vis-tile-processor" -ql) quay.io/hotosm/hot-mapping-vis-tile-processor-$DEPLOY_BRANCH
docker commit $(docker ps -f "ancestor=hot-mapping-vis-api-prod" -ql) quay.io/hotosm/hot-mapping-vis-api-$DEPLOY_BRANCH
docker commit $(docker ps -f "ancestor=hot-mapping-vis-renderer-prod" -ql) quay.io/hotosm/hot-mapping-vis-renderer-$DEPLOY_BRANCH
docker commit $(docker ps -f "ancestor=hot-mapping-vis-server" -ql) quay.io/hotosm/hot-mapping-vis-server-$DEPLOY_BRANCH
docker push quay.io/hotosm/hot-mapping-vis-frontend-$DEPLOY_BRANCH
docker push quay.io/hotosm/hot-mapping-vis-tile-processor-$DEPLOY_BRANCH
docker push quay.io/hotosm/hot-mapping-vis-api-$DEPLOY_BRANCH
docker push quay.io/hotosm/hot-mapping-vis-renderer-$DEPLOY_BRANCH
docker push quay.io/hotosm/hot-mapping-vis-server-$DEPLOY_BRANCH

eb use $DEPLOY_ENV
echo Deploying $VERSION to $DEPLOY_ENV
eb deploy -l $VERSION --timeout 30
