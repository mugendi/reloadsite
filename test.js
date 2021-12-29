// Copyright 2021 Anthony Mugendi
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

process.env.DEBUG="*"

const reloadSite = require('.');


const reloader = reloadSite({
    port:4566
});


const opts = {
    // You can delay reload 
	// delay:3000
    // Or disable auto reloading in total in favour for manual reloading
	autoReload: false,
};

reloader.watch(
	['/home/mugz/projects/node/tests/cms/sites/proxapi/layouts'],
	opts
);

reloader.on('changed', function (file) {
	console.log(`${ file } changed... reloading`);
    // Trigger Site Reload
	reloader.reload();
});
