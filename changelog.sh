#/usr/bin

git --no-pager log origin/release-$1...origin/release-$2 --merges --pretty=format:'* %s: %b' |
grep 'Merge pull' |
sed -e 's/^.*\(HG-[0-9]*\)/* [\1](https:\/\/wikia-inc\.atlassian\.net\/browse\/\1)/' \
	-e 's/* .*from Wikia\//* /' \
	-e 's/).*:/)/'
