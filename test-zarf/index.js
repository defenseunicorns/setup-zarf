const core = require('@actions/core');
const exec = require('@actions/exec');

async function testZarf() {
    try {
        // Get the absolute path to the zarf binary as input
        const zarf = core.getInput('zarfPath');

        // Execute zarf
        await exec.exec(zarf);

    }   catch (err) {
        core.setFailed(err);
    }
}

testZarf();