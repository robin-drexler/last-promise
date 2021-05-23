# last-promise

Creates a function which will only ever resolve the promise of the latest function invocation.
Useful to avoid updating UI with outdated data when a prior debounced function call resolves after one that was made after.

```js
import { lastPromise } from "last-promise";

const fetchApiResult = lastPromise(() => {
  return fetch("https://httpbin.org/status/200");
});

// this will never resolve because the same function is called before it resolved
fetchApiResult();

// this will resolve
fetchApiResult();
```
