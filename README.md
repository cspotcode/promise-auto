Like async.auto but with Promises, less boilerplate, and proper typechecking.

Run a collection of async functions in parallel.  Any function can `await` the resolution of
any other function by name: `await this.nameOfFunction`
Once all functions have resolved, the return promise will resolve with a dictionary of the
unwrapped return values from each function.

## Example:

*Based on an example from `async`'s documentation*

```typescript
import {auto} from 'promise-auto';

const results = await auto({
    async getData() {
        // async code to get some data
        return backend.getSomeData();
    },
    async makeFolder() {
        // async code to create a directory to store a file in
        // this is run at the same time as getting the data
        const folder = await backend.makeFolder();
        return folder;
    },
    async writeFile() {
        // once there is some data and the directory exists,
        // write the data to a file in the directory
        const file = await backend.writeFileInDirectory(await this.makeFolder, await this.getData);
        return file;
    },
    async email_link() {
        // once the file is written let's email a link to it...
        // results.write_file contains the filename returned by write_file.
        return sendEmail({'file': await this.writeFile, 'email': 'user@example.com'});
    }
});
console.log('results = ', results);
```