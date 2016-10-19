# glsl-simple-include

Preprocessor for a simple "#pragma include" directive.

```bash
npm install glsl-simple-include --save
```

```glsl
#pragma include "/path/to/file.glsl"
```

```javascript
var GlslSimpleInclude = require('read-text-file');
var readTextFile = require('read-text-file');
var path = require('path');

var processPromise = GlslSimpleInclude.processIncludes(
	readTextFile.read,
	path,
	"/path/to/file.glsl",
	null);
```