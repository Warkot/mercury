set -e
set -o pipefail
mkdir jenkins || rm -rf jenkins/* && true

# $1 - context
# $2 - state
# $3 - description
# $4 - target url
updateGit() {
curl -s \
	-X POST  \
	-H "Authorization: token $GITHUB_TOKEN" \
	-d "{ \"state\": \"$2\", \"description\": \"$3\", \"context\": \"$1\", \"target_url\": \"$4\" }" \
	https://api.github.com/repos/Wikia/mercury/statuses/$GIT_COMMIT
}

### Those tests depends on Mercury Build step
failTests() {
	updateGit "Front tests" failure skipped
	updateGit "Server tests" failure skipped
	updateGit "Linter" failure skipped
	updateGit "Mercury PR Checks" failure finished $BUILD_URL"console"
}

### Set pending status to all tasks
updateGit "Mercury PR Checks" pending running $BUILD_URL"console"
updateGit "Mercury build" pending pending
updateGit "Front tests" pending pending
updateGit "Server tests" pending pending
updateGit "Linter" pending pending

### Mercury build - copy cached node_modules and update them
updateGit "Mercury build" pending "copying cached node_modules"
md5old=$(md5sum ../Mercury-UPDATE-node-modules-old/package.json | sed -e "s#\(^.\{32\}\).*#\1#")
md5new=$(md5sum package.json | sed -e "s#\(^.\{32\}\).*#\1#")

if [ "$md5new" = "$md5old" ]
then
	### Mercury build - creating symlink to node packages
	ln -s ../Mercury-UPDATE-node-modules-old/node_modules node_modules
else
	### Mercury build - updating node packages
	cp -R ../Mercury-UPDATE-node-modules-old/node_modules node_modules
	updateGit "Mercury build" pending "updating node packages"
	npm install || error1=true
	
	if [[ ! -z $error1 ]]
	then
		updateGit "Mercury build" failure "failed on: updating node packages" $BUILD_URL"artifact/jenkins/mercury-build.log"
		failTests && exit 1
	fi
fi

### Mercury build - updating bower packages
updateGit "Mercury build" pending "updating bower packages"
bower update || error2=true

if [[ ! -z $error2 ]]
then
	updateGit "Mercury build" failure "failed on: updating bower packages" $BUILD_URL"artifact/jenkins/mercury-build.log"
	failTests && exit 1
fi

### Mercury build - building application
updateGit "Mercury build" pending "building application"
npm run build-test 2>&1 | tee jenkins/mercury-build.log || error3=true
vim -e -s -c ':set bomb' -c ':wq' jenkins/mercury-build.log

if [ -z $error3 ]
then
	updateGit "Mercury build" success success $BUILD_URL"artifact/jenkins/mercury-build.log"
else
	updateGit "Mercury build" failure "failed on: building application" $BUILD_URL"artifact/jenkins/mercury-build.log"
	failTests && exit 1
fi

### Front tests - running
updateGit "Front tests" pending running
npm run test-front 2>&1 | tee jenkins/front-tests.log || error4=true
vim -e -s -c ':set bomb' -c ':wq' jenkins/front-tests.log

if [ -z $error4 ]
then
	updateGit "Front tests" success success $BUILD_URL"artifact/jenkins/front-tests.log"
else
	updateGit "Front tests" failure failure $BUILD_URL"artifact/jenkins/front-tests.log"
fi

### Server tests - running
updateGit "Server tests" pending running
npm run test-server 2>&1 | tee jenkins/server-tests.log || error5=true
vim -e -s -c ':set bomb' -c ':wq' jenkins/server-tests.log

if [ -z $error5 ]
then
	updateGit "Server tests" success success $BUILD_URL"artifact/jenkins/server-tests.log"
else
	updateGit "Server tests" failure failure $BUILD_URL"artifact/jenkins/server-tests.log"
fi

### Linter - running
updateGit "Linter" pending running
npm run linter 2>&1 | tee jenkins/linter.log || error6=true
vim -e -s -c ':set bomb' -c ':wq' jenkins/linter.log

if [ -z $error6 ]
then
	updateGit "Linter" success success $BUILD_URL"artifact/jenkins/linter.log"
else
	updateGit "Linter" failure failure $BUILD_URL"artifact/jenkins/linter.log"
fi

### Finish
updateGit "Mercury PR Checks" success finished $BUILD_URL"console"

