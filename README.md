[![Aptori](https://app.aptori.dev/projectMercuryPurple.svg)](https://aptori.dev/)

# Aptori Sift Action


Aptori is an AI-Enabled [developer tool for API Testing](https://aptori.dev/)
and Application Security Testing.

Aptori leverages AI to assist in the development of secure, high-quality
software. Our Semantic Reasoning Technology comprehends the structure of your
application, allowing for autonomous application testing. This efficiency frees
developers from time-consuming testing tasks while ensuring the software is
secure and functions as intended.

Sift uses AI to understand the application's API semantically, identifying how
different operations connect and creating a logical flowchart of these
workflows. It then tests these workflows by providing appropriate input values,
checking that the application's business logic is accurate at each stage.

Integrate Sift in your CI to identify business logic bugs and security
vulnerabilities in your applications with Aptori Autonomous [Application
Security Testing](https://aptori.dev/appsec/security-testing). Sift Action is a
[GitHub Action](https://docs.github.com/actions) that runs Aptori's Sift CLI
tool in a continous integration (CI) workflow.


## Additional Information

* Watch [How Aptori Works](https://aptori.dev/product/why-aptori) for a look at the
  technology that makes Sift unique.
* [Aptori Documentation](https://docs.aptori.dev/) has further details on the
  Sift CLI tool and the Aptori Platform.
* [GitHub
  Workflows](https://docs.github.com/actions/using-workflows/about-workflows)
  has further details about configuring jobs in GitHub Actions.


## Getting Started

### 1. Get your Aptori account
To run Sift, you need to have an account on Aptori. Get in touch with our
expert team to set up a [trial
account](https://aptori.dev/get-aptori-book-a-demo). After activating your
account, you can employ `sift-action` to evaluate your application’s API, and
automatically upload the findings to the Aptori Platform.

### 2. Add Sift to your workflow
Go to the GitHub Repository on which you want to run Sift. Add the
`sift-action` to an existing GitHub workflow or create a new workflow.
A sample workflow file is provided below under [Example Workflow](#example-workflow).

In your GitHub repository settings, add values in secrets and variables that
are used for input values of the Action.

* Define a
  [secret](https://docs.github.com/actions/security-guides/encrypted-secrets)
  named `SIFT_PLATFORM_KEY` that contains the value of an Aptori Platform Key.
  This secret is used for the required input `platformKey` in the workflow
  example below.
* Define a
  [variable](https://docs.github.com/en/actions/learn-github-actions/variables#creating-configuration-variables-for-a-repository)
  named `SIFT_CONFIGURATION_ID` that contains the ID of a configuration created
  in the Aptori Platform.  This variable is used for the required input
  `configurationId` in the workflow
  example below.


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

    #
    # Permissions to upload the Code Scanning result
    # (only necessary if using GitHub Advanced Security and SARIF upload below)
    #
    permissions:
      actions: read
      contents: read
      security-events: write

    steps:
    - name: Check out repo
      uses: actions/checkout@v4

    #
    # Example of building and running an application with Docker.
    #
    # Note, this is an example.  Add workflow step(s) to deploy or run an
    # instance of your application.
    #
    - name: Build and run the application
      run: |
        docker build -t myapp:latest .
        docker network create network1
        docker run -d -p 5000:5000 --network network1 --name myapp myapp:latest

    #
    # Run Sift using platform key and configuration ID stored in your repository secrets
    #
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

    #
    # Optional: Upload SARIF file to GitHub Code Scanning
    # (requires GitHub Advanced Security)
    #
    - name: Upload SARIF file
      uses: github/codeql-action/upload-sarif@v2
      with:
        # Path to SARIF file relative to the root of the repository
        sarif_file: sift.sarif
        # Category for the results - to differentiate multiple results for one commit
        category: aptori-sift
```
