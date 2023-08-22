const core = require('@actions/core');
const utils = require('./utils');

async function run() {
  core.info('Starting Sift Action');
  const inputs = utils.gatherInputs();
  const dockerCommand = utils.buildDockerCommand(inputs);
  let exitCode = 0;
  let scanData;

  // Run the scanner

  scanData = await utils.runCommand(dockerCommand);
  exitCode = scanData.exitCode;
  core.debug(`Scanner exit code: ${scanData.exitCode}`);
  core.debug(`Scanner output: ${scanData.execOutput}`);

  process.exit(exitCode);
}

run();
