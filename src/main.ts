import { setupZarf, zarfFileName } from "./setup-zarf";

async function execute() {
    await setupZarf(zarfFileName);
}

execute();