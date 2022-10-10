import core from '@actions/core';
import exec from '@actions/exec';
import tc from '@actions/tool-cache';
import fs, { unlink } from 'fs';
import os from 'os';
import path from 'path';
import { getZarfBinary } from './lib/utils';

async function setupZarf() {
  try {
    // Get version of zarf to be installed
    const version = core.getInput('version');

    const destination = path.join(os.homedir(), ".zarf/bin/zarf");
    core.info("Install destination is ${destination}");

    // Download the specified version of zarf
    const download = getZarfBinary(version);
    const pathToBinary = await tc.downloadTool(download.url, destination);
    core.debug("Successfully downloaded ${download.url}");

    // Set executable permission for the zarf binary
    fs.chmod(pathToBinary, 100, (err) => {

      if (err) {
        core.setFailed(err);
      } else {
        core.info("Successfully added executable permission to zarf binary...");
      }
  
    });

    // Expose the zarf binary by adding it to the PATH
    core.addPath(pathToBinary);

    // Execute the zarf binary
    await exec.exec("zarf");

  } catch(err) {
      if (typeof err === "string") {
        err.toUpperCase()
        core.setFailed(err);
      } else if (err instanceof Error) {
        err.message
        core.setFailed(err);
      }
  }
}

setupZarf();