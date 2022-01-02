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

const socketURL = `http://localhost:{{PORT}}/ws`;

function start(isReloaded = false) {
	let sockjs = new SockJS(socketURL);

	sockjs.onopen = function () {
		console.log('RealoadSite Ready', sockjs.protocol);
		// if reloaded, then refresh page at least
		if (isReloaded) window.location.reload();
	};

	sockjs.onmessage = function (e) {
		//reload
		if (e.data == 'reload') {
			window.location.reload();
		}
	};

	sockjs.onclose = function () {
		// print('[*] close');
		console.log('RealoadSite Socket Closed');
		// retry to connect
		setTimeout(() => {
			start(true);
		}, 2000);
	};
}

start();
