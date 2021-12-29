# Motivation

There are a variety of livereload modules out there so be sure to select what works for you.

This module serves the following specific purposes:

-   **Events:** It emits a number of events that you can listen to. This is useful in the event you want to run a few other stuff before or after the site reloads.

    -   The **changed** event fires immediately a change is detected.
    -   The **reloaded** event fires after the reload message has been sent to socket

-   **Manual Reloads:** In addition to being able to delay the reload process. You can also completely disable it using the **autoReload** option and instead trigger the reload process manually. This is useful where you wish to run processes before reloading and you cannot predict how long those processes will take, hence a simple delay wont cut it.

## Using ReloadSite

` yarn add reloadsite` of course!

```javascript
const reloadSite = require('.');

const serverOptions = {
    // defaults to the common livereload port 35729
	port: 35729
};

const reloader = reloadSite(serverOptions);

const  reloadOptions = {
	// You can delay reload
	// delay:3000
	// Or disable auto reloading in favour for manual reloading
	autoReload: false,
};

reloader.watch(
    // the directories to watch as an array
	['/path/to/dir', 'path/to/another/dir'],
	reloadOptions
);

// Because we set autoReload to false, we want to listen to change event and manually reload
reloader.on('changed', async function (file) {

    // Ok let's log what has happened
	console.log(`${file} changed... reloading`);

    // we run some long process before reloading
    await  some_long_running_process()
    
	// Manually trigger site reload
	reloader.reload();

});


function some_long_running_process(){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 2000);
    });
}

```

For the client-end, use:

```html

<!-- ReloadSite Uses sockjs so you will need this line -->
<script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>

<!-- Then load the simple script that executes the actual reloading -->
<script src="http://localhost:35729/reloadsite.js"> 
</script>

```