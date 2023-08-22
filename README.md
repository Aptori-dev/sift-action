[![Aptori](https://app.aptori.dev/projectMercuryPurple.svg)](https://aptori.dev/)

# Aptori Sift Action

Aptori is an AI-driven application testing platform.  Harnessing the power of
AI, Aptori autonomously constructs, executes, and maintains tests to ensure
secure, compliant, and efficient APIs.  Aptori analyzes the behavior of your
application's API using sophisticated stateful request chains to identify
hard-to-find defects and vulnerabilities in the business logic of your
application before an attacker does.

Sift Action is a [GitHub Action](https://docs.github.com/actions) that runs
Aptori's Sift CLI tool in a continous integration (CI) workflow to test your
application.


## Getting Started

### 1. Create an Aptori Account
Go to the [Aptori sign up page](https://app.aptori.dev/sign-up).

### 2. Add An API
To test an API, you must first [add an API](https://app.aptori.dev/api/add) in
the Aptori Platform.

### 3. Create A Platform Key
Sift requires a platform key to post test results to the Aptori platform.
[Create a platform key](https://app.aptori.dev/platform-keys) and save it, as
it will only be shown once. You will need to provide the key to sift to run a
test.

### 4. Create a Configuration for your test
[Create a configuration](https://app.aptori.dev/configurations) in the Aptori
Platform. After you have created a configuration, copy the configuration ID by
clicking on the ID in the configurations list.

### 5. Add Sift to your workflow
Go to your GitHub Repository on which you would like to run the Sift tool. Add
the `aptori-sift` action to an existing GitHub workflow or create a new
workflow. A sample workflow file is provided below under [Example
Workflow](#example-workflow).

You need to add `platformKey` and `configurationId` from previous steps to your
[repository secrets](https://docs.github.com/actions/security-guides/encrypted-secrets).

### 6. Run results
When Sift run completes, the scan results will be available on [Runs
page](https://app.aptori.dev/runs) of the Aptori Platform.


## Additional Information

* [Aptori Documentation](https://docs.aptori.dev/) has further details on the
  Sift CLI tool and the Aptori Platform.
* [GitHub
  Workflows](https://docs.github.com/actions/using-workflows/about-workflows)
  has further details about configuring jobs in GitHub Actions.


## Action Inputs

### `platformKey`
**Required** \
Aptori Platform key.

### `configurationId`
**Required** \
ID of configuration to fetch from Aptori Platform.

### `targetUrl`
**Optional** \
URL where application API can be accessed. This overrides the URL specified in the configuration.

### `labels`
**Optional**  \
Space-separated list labels in key=value form to append to the metdata for a test run.

### `network`
**Optional** \
Docker network bridge name. Make sure your application under test runs in the same network.


## Action Outputs

Sift outputs test results in SARIF format in file `sift.sarif` in the workspace
where the Action is run.


## Example Workflow

Below is a sample workflow that uses Sift Action.  This workflow uses a secret
(`SIFT_PLATFORM_KEY`) and variable (`SIFT_CONFIGURATION_ID`) that are defined in
the repository settings.

```yaml
# An example workflow file to help you get started
name: Run Sift

# Controls when the workflow will run
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  aptori-sift:
    name: Aptori Sift
    runs-on: ubuntu-latest

    # Permissions to upload the Code Scanning result
    permissions:
      actions: read
      contents: read
      security-events: write

    steps:
    - name: Check out repo
      uses: actions/checkout@v3

    # Example of building and running an application with Docker.
    - name: Build and run the application
      run: |
        docker build -t myapp:latest .
        docker network create network1
        docker run -d -p 5000:5000 --network network1 --name myapp myapp:latest

    # Run Sift using platform key and configuration ID stored in your repository secrets
    - name: Run Sift
      uses: Aptori-dev/sift-action@v1
      with:
        platformKey: ${{ secrets.SIFT_PLATFORM_KEY }}
        configurationId: ${{ vars.SIFT_CONFIGURATION_ID }}
        targetUrl: http://myapp:5000
        network: network1
        # User-defined labels can be used to help distinguish a particular run
        labels: |
          GITHUB_RUN_ID=${{github.run_id}}
          GITHUB_RUN_NUMBER=${{github.run_number}}
          commit=${{github.sha}}

    # Upload SARIF file to GitHub Code Scanning
    - name: Upload SARIF file
      uses: github/codeql-action/upload-sarif@v2
      with:
        # Path to SARIF file relative to the root of the repository
        sarif_file: sift.sarif
        # Category for the results - to differentiate multiple results for one commit
        category: aptori-sift
```
