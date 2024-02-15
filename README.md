# playground-test-auto-release
Playground repo for testing automatic github releases

# Description
A simple HTTP echo server build with express.

# Working example (with downsites)
```yml
name: Release Workflow

on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    permissions: write-all

    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run release

      - name: "Read package.json"
        run: echo "PACKAGE_JSON=$(jq -c . < package.json)" >> $GITHUB_ENV
          
      - uses: ncipollo/release-action@v1        
        with:
          artifacts: "dist/*"
          tag: "v${{ fromJson(env.PACKAGE_JSON).version }}"
          generateReleaseNotes: true
          skipIfReleaseExists: true
```
This works, but has some down sites:
- Could be run, even when pull request is closed
- Run when pushed directly to master

To ensure, the job runs only when:
- Event must be a Pull Request
- Type of event must be closed
- Pull Request is be merged

Change it to:
```yml
on:
  pull_request:
    branches:
      - develop
    types:
      - closed

# Later, in the jobs section of your actions.yml file.
jobs:
  if_merged:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
    - run: |
        echo The PR was successfully merged.
```

See: https://github.com/orgs/community/discussions/67160#discussioncomment-7013693