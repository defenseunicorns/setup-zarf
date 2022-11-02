const { setupZarf } = require("./lib/setup-zarf");

async function execute() {
    setupZarf();
}

execute();