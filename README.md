# Palindrom
<p align="center">
  <img alt="Palindrom Logo" src="https://cloud.githubusercontent.com/assets/17054134/23406359/e2690c08-fdbe-11e6-8880-c23dc771f899.png">
</p>

[![Build Status](https://travis-ci.org/Palindrom/Palindrom.svg?branch=master)](https://travis-ci.org/Palindrom/Palindrom)
[![npm version](https://badge.fury.io/js/palindrom.svg)](https://badge.fury.io/js/palindrom)
[![MIT](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://opensource.org/licenses/MIT)

---

Library for two-way data binding between local JSON view models and remote, using JSON-Patch, w/ optional OT, via HTTP or WebSocket.

Implements [Server communication](https://github.com/Starcounter-Jack/PuppetJs/wiki/Server-communication).

For additional binding with DOM, browser history, etc. use [PalindromDOM](#PalindromDOM).

### Installation

#### You can install using [bower](http://bower.io/) and [NPM](http://npmjs.com/):

##### Bower:

```sh
bower install Palindrom
```

Then add source to your `<head>`:

```html

<!-- include Palindrom bundle -->
<script src="bower_components/Palindrom/dist/palindrom.js"></script>
```
See [Dependencies section](https://github.com/Palindrom/Palindrom#dependencies) for more details.

##### NPM:

```sh
npm install palindrom --save
```

Then you can require it CommonJS or ES6/TS style:

###### CommonJS:
```js
var Palindrom = require('palindrom');
```

###### ES6/TS:
```js
import Palindrom from 'palindrom'
```

Or just download it manually from [github](https://github.com/Palindrom/Palindrom).

### Usage

After DOM is ready, initialize with the constructor:

```js
/**
 * Defines a connection to a remote PATCH server, gives an object that is persistent between browser and server
 */
var palindrom = new Palindrom({remoteUrl: window.location.href});

// ..
// use palindrom.obj
palindrom.obj.someProperty = "new value";
```
*Please make sure you pass the correct PATCH server URL.*

### Demo

[Example of Palindrom + PalindromDOM with Polymer's Template Binding and Web Components](http://Palindrom.github.io/Palindrom/lab/polymer/index.html)

### Options (`Palindrom()` constructor parameters)
All the parameters are optional.
```javascript
var palindrom = new Palindrom({attribute: value});
```

Attribute              | Type          | Default                | Description
---                    | ---           | ---                    | ---
`remoteUrl`            | *String*      |  **Required**          | PATCH server URL
`callback`             | *Function*    |                        | Called after initial state object is received from the server (NOT necessarily after WS connection was established)
`obj`                  | *Object*      | `{}`                   | Your initial state object, **NOTE: this object is deep cloned as the initial state, make sure to use `palindrom.obj` to issue patches and have them applied, the object you pass will not be observed**.
`useWebSocket`         | *Boolean*     | `false`                | Set to `true` to enable WebSocket support
`ignoreAdd`            | *RegExp*      |                        | Regular Expression for `add` operations to be ignored (tested against JSON Pointer in JSON Patch)
`debug`                | *Boolean*     | `true`                 | Toggle debugging mode
`onLocalChange`        | *Function*    |                        | Helper callback triggered each time a change is observed locally
`onRemoteChange`       | *Function*    |                        | Helper callback triggered each time a change is received from the server and applied.
`onPatchReceived`      | *Function*    |                        | Helper callback triggered each time a JSON-patch is received, accepts three parameters: (*String* `data`, *String* `url`, *String*, `method`)
`onPatchSent`          | *Function*    |                        | Helper callback triggered each time a JSON-patch is sent, accepts two parameters: (*String* `data`, *String* `url`, *String*, `method`)
`onSocketStateChanged` | *Function*    |                        | Helper callback triggered when socket state changes, accepts next parameters: (*int* `state`, *String* `url`, *String* `data`, *int* `code`, *String* `reason`)
`onConnectionError`    | *Function*    |                        | Helper callback triggered when socket connection closed, socket connection failed to establish, http requiest failed. Accepts next parameters: (*Object* `data`, *String* `url`, *String*, `method`). The data object contains the following properties: *String* `statusText` (HTTP response status code reason phrase or WebSocket error title), *String* `statusCode` (HTTP response status code or WS error code), *Number* `readyState`, *String* `url`, *String* `reason` (HTTP error response body or WebSocket disconnection reason message)
`onIncomingPatchValidationError`    | *Function*    |                        | Helper callback triggered when a wrong patch is received. It accepts one `Error` parameter.
`onOutgoingPatchValidationError`    | *Function*    |                        | Helper callback triggered when a wrong patch is locally issued. It accepts one `Error` parameter.
`localVersionPath`     | *JSONPointer* | `disabled`             | local version path, set it to enable Versioned JSON Patch communication
`remoteVersionPath`    | *JSONPointer* | `disabled`             | remote version path, set it (and `localVersionPath`) to enable Versioned JSON Patch communication
`ot`                   | *Boolean*     | `false`                | `true` to enable OT (requires `localVersionPath` and `remoteVersionPath`)
`purity`               | *Boolean*     | `false`                | `true` to enable purist mode of OT
`pingIntervalS`        | *Number*      | `0`                    | Palindrom will generate heartbeats every `pingIntervalS` seconds if no activity is detected. `0` - disable heartbeat
`retransmissionThreshold`| *Number*    | `3`                    | After server reports this number of messages missing, we start retransmission
`onReconnectionCountdown`| *Function*  |                        | Triggered when palindrom detected connection problem and reconnection is scheduled. Accepts number of milliseconds to scheduled reconnection. Called every second until countdown reaches 0 (inclusive)
`onReconnectionEnd`    | *Function*    |                        | Triggered when palindrom successfully reconnected
`jsonpatch`            | *Object*      | `window.jsonpatch`       | The provider object for jsonpatch `apply` and  `validate`. By default it uses Starcounter-Jack/JSON-Patch library.

most of them are accessible also in runtime:

#### Properties

```js
palindrom.property
```
Attribute             | Type       | Default                | Description
---                   | ---        | ---                    | ---
`remoteUrl`           | *String*   | **Required**           | See above
`useWebSocket`        | *Boolean*  | `false`                | See above
`ignoreAdd`           | *RegExp*   |                        | See above
`debug`               | *Boolean*  | `true`                 | See above
`onRemoteChange`      | *Function* |                        | See above
`onPatchReceived`     | *Function* |                        | See above
`onSocketStateChanged`| *Function* |                        | See above
`onPatchSent`         | *Function* |                        | See above
`onConnectionError`   | *Function* |                        | See above
`onIncomingPatchValidationError`   | *Function* |                        | See above
`onOutgoingPatchValidationError`   | *Function* |                        | See above


### Binding object once is ready (`callback`)
To bind object where you need once it will be fetched from remote you can use define `callback` in constructor:
```js
var palindrom = new Palindrom({remoteUrl: url, callback: function (obj) {
  document.getElementById('test').model = obj;
}});
```

### Sending client changes to remote

Palindrom detects changes to the observed object synchronously. So after
```javascript
palindrom.obj.some="change";
```
The JSON Patch request will be send to the remote.

### Two-way data binding frameworks

Palindrom works superbly with frameworks that allow for two-way data binding, such as Polymer, React, Vue and Angular. These frameworks have the ability to bind an `<input>` element to a JavaScript data model in a way that the object updates after each keystroke. In consequence, Palindrom sends a patch the server after each keystroke.

If you want to opt-out from such behavior, you need to force your framework to update the data model after the element is unfocused (`blur` event). Depending on the framework:

- In Polymer 0.5 it is only possible with a Custom Element that extends the native `<input>`, similarly but not exactly how [`core-input`](https://github.com/Polymer/core-input/blob/master/core-input.html) is dome
- In Polymer 0.9+, use built-in `<input value="{{bindValue::blur}}">`
- In Angular 1.3+, use built-in `<input type="text" ng-model="name" ng-model-options="{updateOn: 'blur'}" />`

### Generating patches based on local changes

Palindrom automatically observes local changes. This is implemented by ES6 Proxies, triggered with every modification the `palindrom.obj` object.

### Ignoring local changes (`ignoreAdd`)

If you want to create a property in the observed object that will remain local, there is an `ignoreAdd` option and property that
let's you disregard client-side "add" operations in the object using a regular expression. Sample usage:

```javascript
// in constructor
var palindrom = new Palindrom({remoteUrl: url, obj: myObj, ignoreAdd: /\/_.+/});
// or via property
palindrom.ignoreAdd = null;  //undefined or null means that all properties added on client will be sent to server
palindrom.ignoreAdd = /./; //ignore all the "add" operations
palindrom.ignoreAdd = /\/\$.+/; //ignore the "add" operations of properties that start with $
palindrom.ignoreAdd = /\/_.+/; //ignore the "add" operations of properties that start with _
// .. later on any
myObj._somethingNew = 1; // will not be propagated to server
```

### Upgrading to WebSocket (`useWebSocket`)

You can upgrade the communication protocol to use WebSocket by setting `useWebSocket: true` option in Palindrom constructor or you can switch it at any moment by `palindrom.useWebSocket = true`.

WebSocket is a replacement for requests that would be sent using `HTTP PATCH` otherwise. The requests sent over `HTTP GET` (such as link clicks) are not affected.

:bulb: Note that this is an experimental implementation in which the WebSocket upgrade request URL taken from `X-Location` header of your first AJAX call response.

Sample:

```javascript
// enable it in constructor
var palindrom = new Palindrom({remoteUrl: url, useWebSocket: true});
// change it later via property
palindrom.useWebSocket = false;
```

### Heartbeat and reconnection

Palindrom will try to detect connection problems and then reconnect to server. If `pingIntervalS` is set it determines maximal time without network activity. When this time passes and no activity has been detected
Palindrom will issue a heartbeat patch (an empty patch, consisting only of version operations).

When connection problem is detected (e.g. there was no response to heartbeat or websocket has been closed) palindrom will schedule reconnection and trigger `onReconnectionCountdown` callback with number of milliseconds
to scheduled reconnection as argument, it will then trigger it every second. When countdown reaches 0 (callback is still called then) palindrom will try to reconnect (using `/reconnect` endpoint) to server. If this reconnection
fails then new reconnection will be scheduled for twice as many seconds (i.e. first it will occur after a seconds, then two seconds, then four, etc.). If reconnection succeeds, `onReconnectionEnd` callback will be triggered
and normal operations will continue.

For successful reconnection, palindrom sends a list of pending patches (those sent, but unconfirmed by server) to `/reconnect` endpoint and accepts a new state (along with version numbers) as a response. It then resets
to this new state and resumes its operations.

### Dependencies

If you use the bundle, no dependencies are needed. However for more information, you can view all the dependencies in [package.json](https://github.com/Palindrom/Palindrom/blob/master/package.json).

### Development

1. Make a local clone of this repo: `git clone git@github.com:Palindrom/Palindrom.git`
2. Go to the directory: `cd Palindrom`
3. Install the local dependencies: `npm install`
5. Start the development server: `polyserve -p 8000`
6. Open the demo: [http://localhost:8000/components/Palindrom/lab/polymer/index.html](http://localhost:8000/components/Palindrom/lab/polymer/index.html)
7. Open the test suite: [http://localhost:8000/components/Palindrom/test/MochaSpecRunner.html](http://localhost:8000/components/Palindrom/test/MochaSpecRunner.html)

### Releases

To release new version run

```sh
grunt uglify bump
...
npm publish

```

### Testing

Please follow steps 5, 6 and 7 from [here](#Development).

### Changelog

To see the list of recent changes, see [Releases](https://github.com/Palindrom/Palindrom/releases).

---

PalindromDOM
========

Extension to [Palindrom](#Palindrom) that adds DOM into two-way data binding chain (DOM ↔ local JSON ↔ remote JSON). Client side library that binds data on DOM level, so it integrates nicely with good old JavaScript, WebComponents, or Angular.

Implements [Server communication](https://github.com/Starcounter-Jack/Palindrom/wiki/Server-communication).

### Installation

#### You can install using [bower](http://bower.io/) and [NPM](http://npmjs.com/):

##### Bower:

```sh
bower install Palindrom
```

Then add source to your head:

```html

<!-- include Palindrom bundle -->
<script src="bower_components/Palindrom/dist/palindrom-dom.js"></script>
```
See [Dependencies section](https://github.com/Palindrom/Palindrom#dependencies) for more details.

##### NPM:

```sh
npm install palindrom --save
```

Then you can require it CommonJS or ES6/TS style:

###### CommonJS:
```js
var PalindromDOM = require('palindrom/src/palindrom-dom');
```

###### ES6/TS:
```js
import PalindromDOM from 'palindrom/src/palindrom-dom'
```

### Usage

After DOM is ready, initialize with the constructor:

```js
/**
 * Defines a connection to a remote PATCH server, gives an object that is persistent between browser and server
 */
var palindrom = new PalindromDOM({remoteUrl: window.location.href});
```

*Please make sure you pass the correct PATCH server URL.*

Now any changes to `palindrom.obj` will trigger a HTTP PATCH request. And any received will be applied.

### Demo

[Example with Polymer's Template Binding and Web Components](http://Palindrom.github.io/Palindrom/lab/polymer/index.html)

### Options (`PalindromDOM()` constructor parameters)

PalindromDOM accepts the same option attributes as Palindrom, plus the ones listed below. All the parameters are optional.

```javascript
var palindrom = new PalindromDOM({attribute: value});
```

Attribute           | Type          | Default                | Description
---                 | ---           | ---                    | ---
`listenTo`          | *HTMLElement* | `document.body`        | DOM node, that indicates a root of subtree to listen to events.

most of them are accessible also in runtime:

#### Properties

```javascript
palindrom.property
```
Property   | Type          | Default         | Description
---         | ---           | ---             | ---
`element`   | *HTMLElement* | `document.body` | See `listenTo` above
`listening` | *Boolean*     | `true`          | Is listening on

#### Methods

```javascript
palindrom.method()
```
Attribute   | Type          | Description
---         | ---           | ---
`unlisten`  | *HTMLElement* | Stop listening to DOM events
`listen`    | *HTMLElement* | Start listening to DOM events

### Browser history

Palindrom uses the HTML5 history API to update the URL in the browser address bar to reflect the new page. It also listens to a `popstate` event so it could ask the server for new JSON-Patch to morph the page back to previous state. Due to lack of native `pushstate` event you need to either:
 * call `palindrom.changeState(url)` after your `history.pushState(url)`,
 * call `palindrom.morph(url)` - that will call `pushState` and update palindrom's state for you,
 * trigger `palindrom-redirect-pushstate` with `{url: "/new/url"}` on `window` after your `history.pushState(url)`,
 * or use [`<palindrom-redirect>`](https://github.com/Palindrom/palindrom-redirect) Custom Element that does it for you.

### Development

Same steps in Palindrom Development section. **tests cover both**.

### Releases

Same steps in Palindrom Releases section.

### Testing

#### Local testing with your browser

Start a web server:

```sh
polyserve -p 8000
```
Open `http://127.0.0.1:8000/components/Palindrom/test/MochaSpecRunner.html` in your web browser to run Mocha test suite.

#### Testing with CLI and SauceLabs

- Install [Sauce Connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy).

- Add your `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` environment variables to your machine.

- Connect to SauceLabs using the command
 `sc /u YOUR_SAUCE_USER /k YOUR_SAUCE_ACCESSKEY`

- Start a web server `polyserve -p 8000`

- In project's root folder, run `npm test`


### Changelog

To see the list of recent changes, see [Releases](https://github.com/Palindrom/Palindrom/releases).

## License

MIT
