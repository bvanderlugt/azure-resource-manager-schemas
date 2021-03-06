import * as constants from '../constants';
import { cloneAndGenerateBasePaths, validateAndReturnReadmePath } from '../specs';
import { series } from 'async';
import { generateSchemas, clearAutogeneratedSchemas } from '../generate';
import { whitelist } from '../whitelist';

series([async () => {
    await cloneAndGenerateBasePaths(constants.specsRepoPath, constants.specsRepoUri, constants.specsRepoCommitHash);

    await clearAutogeneratedSchemas();

    let hadErrors = false;
    for (const whitelistEntry of whitelist) {
        try {
            const readme = await validateAndReturnReadmePath(whitelistEntry.basePath);

            await generateSchemas(readme, whitelistEntry);
        } catch(error) {
            console.error(`Caught exception processing whitelist entry ${whitelistEntry.basePath}.`)
            console.error(error);

            hadErrors = true;
        }
    }

    if (hadErrors) {
        throw new Error('Autogeneration failed. See logs for detailed information.');
    }
}]);