[![types included](https://img.shields.io/badge/types-included-green.svg)](#typescript-declarations)
[![npm](https://img.shields.io/npm/v/@cspotcode/promise-auto.svg)](https://npmjs.com/package/@cspotcode/promise-auto)
[![TravisCI](https://img.shields.io/travis/cspotcode/promise-auto.svg)](https://travis-ci.org/cspotcode/promise-auto)

Like async.auto but with Promises, less boilerplate, and proper typechecking.

Run a collection of async functions ("tasks") in parallel.  Any task can `await` the resolution of
any other task by name: `await this.nameOfFunction`
Once all tasks have resolved, the return promise will resolve with a dictionary of the
unwrapped return values from each task.

*Type declarations require TypeScript 2.8, which at the time of writing, is still in development.  `npm install typescript@next`*

## Example

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
    async emailLink() {
        // once the file is written let's email a link to it...
        // results.write_file contains the filename returned by write_file.
        return sendEmail({'file': await this.writeFile, 'email': 'user@example.com'});
    }
});
console.log('results = ', results);
```

### Why `this`?

Normally I avoid custom bindings of `this`, instead favoring positional arguments.  In this case, `this` is more compatible with type inference, so it should
give you better tab completion and static analysis.
I also pass the same object as an argument to each task, so you can
use whichever you prefer.

```typescript
    async foo(others) {
        // both of these are equivalent
        await this.bar;
        await others.bar;
    }
```

### TypeScript Declarations

This library includes bundled TypeScript type declarations.
Enable `"moduleResolution": "node"` in your `tsconfig.json` and it will work
automatically.  Editors such as VSCode can even use these declarations to
give you tab completion and documentation tooltips in your plain JavaScript projects.
