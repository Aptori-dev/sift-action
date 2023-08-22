const core = require('@actions/core');
const exec = require('@actions/exec');

// A filter that returns 'true' if an element contains anything other than null or an empty string
function checkNotEmpty(element) {
  return (element !== null && element !== "");
}

// Convert a string to a list of strings. Separator can be any mix of commas, spaces, or newlines
function stringToList(list) {
  return list
    .split(/[, \n]/)
    .filter(checkNotEmpty);
}

// Produce a list of arguments from a list, like ['API_KEY', 'APP_ENV', 'HOST'], and a prefix, like '--env'
function stringifyArguments(list, prefix = '') {
  return list.reduce((accumulator, currentValue) => {
    if (currentValue === '') {
      return `${accumulator}`;
    } else {
      return `${accumulator} ${prefix}"${currentValue}"`.trim();
    }
  }, '')
}

module.exports.gatherInputs = function gatherInputs() {
  core.debug(process.env);
  return {
    workspace: process.env.GITHUB_WORKSPACE || process.cwd(),
    platformKey: core.getInput('platformKey') || '',
    configurationId: core.getInput('configurationId') || '',
    targetUrl: core.getInput('targetUrl') ? `--target-url=${core.getInput('targetUrl')}` : '',
    labels: stringToList(core.getInput('labels')),
    network: core.getInput('network') ? `--network=${core.getInput('network')}` : ''
  }
}

module.exports.buildDockerCommand = function buildDockerCommand(inputs) {
  const labels = stringifyArguments(inputs.labels, '--label=');
  let dockerCommand = (`docker run --tty --rm
    -v ${inputs.workspace}:${inputs.workspace}
    -w ${inputs.workspace}
    ${inputs.network}
    ghcr.io/aptori-dev/sift
    run
    --key=${inputs.platformKey}
    --config-id=${inputs.configurationId}
    ${inputs.targetUrl}
    ${labels}
    --result=sarif:sift.sarif`);
  dockerCommand = dockerCommand.replace(/(?:\r\n|\r|\n)/g, ' ').replace(/  +/g, ' ');
  core.debug(`Docker command: ${dockerCommand}`);
  return dockerCommand;
}

module.exports.runCommand = async function runCommand(command) {
  core.debug(`Running command:`);
  core.debug(command);

  let execOutput = '';
  let scanData = {};
  let execOptions = {};
  const commandArray = command.split(" ");
  execOptions.ignoreReturnCode = true;
  execOptions.listeners = {
    stdout: (data) => {
      execOutput += data.toString();
    }
  };

  await exec.exec(commandArray[0], commandArray.slice(1), execOptions)
    .then(data => {
      scanData.exitCode = data;
      scanData.execOutput = execOutput;
    })
    .catch(error => {
      core.error(error)
    });
  return scanData;
}
