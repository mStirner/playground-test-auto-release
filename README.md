# playground-test-auto-release
Playground repo for testing automatic github releases

# Description
A simple HTTP echo server build with express.

# Working combination of `Gruntfile.js` & `release.yml`
__.github/workflows/release.yml__
```yml
name: Release Workflow

on:
  pull_request:
    branches:
      - main
    types:
      - closed

jobs:
  release:
    if: github.event.pull_request.merged == true
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

      - name: "Build Changelog"
        id: build_changelog
        uses: mikepenz/release-changelog-builder-action@v4
        with:
          commitMode: true
          configurationJson: |
            {
              "categories": [
                {
                  "title": "## What's Changed since #{{FROM_TAG}}",
                  "labels": []
                }
              ],
              "template": "#{{CHANGELOG}}",
              "pr_template": "- #{{TITLE}}\n",
              "empty_template": "#{{OWNER}}\n#{{REPO}}\n#{{FROM_TAG}}\n#{{TO_TAG}}",
              "max_pull_requests": 1000,
              "max_back_track_time_days": 1000
            }          
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: "Create GitHub release"    
        uses: ncipollo/release-action@v1        
        with:
          artifacts: "dist/*"
          tag: "v${{ fromJson(env.PACKAGE_JSON).version }}"
          generateReleaseNotes: false
          skipIfReleaseExists: true
          body: ${{steps.build_changelog.outputs.changelog}}
```

__Gruntfile.js__
```js
const pkg = require("./package.json");
const cp = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");


const PATH_DIST = path.resolve(process.cwd(), "dist");
const PATH_BUILD = path.resolve(process.cwd(), "build");

process.env = Object.assign({
    NODE_ENV: "production"
}, process.env);

module.exports = function (grunt) {

    grunt.initConfig({
        pkg,
        uglify: {
            options: {
                mangle: {
                    toplevel: true
                }
            },
            build: {
                files: [{
                    expand: true,
                    src: [
                        "**/*.js",
                        "**/*.gitkeep",
                        "!Gruntfile.js",
                        "!node_modules/**",
                    ],
                    dest: PATH_BUILD,
                }]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.registerTask("build", () => {
        [
            `rm -rf ${path.join(PATH_BUILD, "/*")}`,
            `rm -rf ${path.join(PATH_DIST, "/*")}`,
            `mkdir -p ${PATH_BUILD}`,
            `mkdir -p ${PATH_DIST}`,
            "grunt uglify",
        ].forEach((cmd) => {
            cp.execSync(cmd, {
                env: process.env,
                stdio: "inherit"
            });
        });
    });

    grunt.registerTask("compress", () => {
        cp.execSync(`cd ${PATH_BUILD} && tar -czvf ${path.join(PATH_DIST, `oh-plg-${pkg.name}.tgz`)} *`, {
            env: process.env,
            stdio: "inherit"
        });
    });

    grunt.registerTask("checksum", () => {

        let m5f = path.join(PATH_DIST, "./checksums.md5");

        fs.rmSync(m5f, { force: true });
        let files = fs.readdirSync(PATH_DIST);
        let fd = fs.openSync(m5f, "w");

        files.forEach((name) => {

            let file = path.join(PATH_DIST, name);
            let content = fs.readFileSync(file);
            let hasher = crypto.createHash("md5");
            let hash = hasher.update(content).digest("hex");
            fs.writeSync(fd, `${hash}\t${name}${os.EOL}`);

        });

        fs.closeSync(fd);

    });

    grunt.registerTask("release", () => {
        [
            "grunt build",
            "grunt compress",
            "grunt checksum"
        ].forEach((cmd) => {
            cp.execSync(cmd, {
                env: process.env,
                stdio: "inherit"
            });
        });
    });

    grunt.registerTask("publish", () => {
        [
            `git tag v${pkg.version}`,
            "git add package.json",
            `git commit -m "Bumped version to v${pkg.version}"`,
            `git push origin v${pkg.version}`,
            "git push"
        ].forEach((cmd) => {
            cp.execSync(cmd, {
                env: process.env,
                stdio: "inherit"
            });
        });
    });

};
```

When a new release should be published:
- change the version in `package.json`
- execute `npm run publish`
- create pull request from `dev` to `main`
- merge

A new tagged release is created with the new version speified in the `package.json` file.

# Todo
- [ ] Check/change `release.yml` to listen on changes on tags instead of pr merges. (https://stackoverflow.com/a/61892639/5781499)


# Links
- https://github.com/orgs/community/discussions/67160#discussioncomment-7013693