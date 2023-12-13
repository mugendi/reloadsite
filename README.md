# Motivation

There are a variety of livereload modules out there so be sure to select what works for you.

This module serves the following specific purposes:

- **Events:** It emits a number of events that you can listen to. This is useful in the event you want to run a few other stuff before or after the site reloads.

  - The **changed** event fires immediately a change is detected.
  - The **reloaded** event fires after the reload message has been sent to socket

- **Manual Reloads:** In addition to being able to delay the reload process. You can also completely disable it using the **autoReload** option and instead trigger the reload process manually. This is useful where you wish to run processes before reloading and you cannot predict how long those processes will take, hence a simple delay wont cut it.

# Server Side

` yarn add reloadsite` of course!

```javascript
const reloadSite = require('reloadsite');

const serverOptions = {
  // defaults to the common livereload port 35729
  port: 35729,
};

const reloader = reloadSite(serverOptions);

const reloadOptions = {
  // You can delay reload. Value in milliseconds
  delay: 300,
  // Or disable auto reloading in favour for manual reloading
  autoReload: true,
};

reloader.watch(
  // the directories to watch
  // can be a string or array
  './public',
  reloadOptions
);
```

## Reload manually

ReloadSite is built to enable you manually trigger auto reload.
You achieve that by listening to the `changed` event.

```javascript
// Because we set autoReload to false, we want to listen to change event and manually reload
reloader.on('changed', async function (file) {
  // Ok let's log what has happened
  console.log(`${file} changed... will reload after a bit...`);

  // we run some long process before reloading
  await some_long_running_process();

  // Manually trigger site reload
  // note passing the file that changed allows ReloadSite to figure out how to reload. See Reloading Section below
  reloader.reload(file);
});
```

# Client Side

For the client-end, use:

```html
<!-- Then load the simple script that executes the actual reloading -->
<script src="http://localhost:35729/reloadsite.js"></script>
```

## Reloading

To Understand how reloading happens we first need to discuss the file extensions that ReloadSite watches by default.

### File Extensions

```javascript
let styleExtensions = ['css'];

let imageExtensions = [
  'jpg',
  'jpeg',
  'jpe',
  'jif',
  'jfif',
  'pjpeg',
  'pjp',
  'png',
  'svg',
  'tif',
  'tiff',
  'webp',
  'apng',
  'avif',
];

let scriptExtensions = [
  'asp',
  'aspx',
  'cgi',
  'htm',
  'html',
  'jhtml',
  'js',
  'jsa',
  'jsp',
  'php',
  'php2',
  'php3',
  'php4',
  'php5',
  'php6',
  'php7',
  'phps',
  'pht',
  'phtml',
  'shtml',
  'xml',
];
```

Styles and images are reloaded by editing the `href` and `src` attributes of the files and adding a timestamp in the format `?ts=24633445544`. This forces the browser to reload only the affected file.

All files types under `scriptExtensions` above are also watched. These force the browser top reload the entire page.
