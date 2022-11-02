const { setupZarf } = require("./lib/setup-zarf");

async function execute() {
    await setupZarf();
}

execute();