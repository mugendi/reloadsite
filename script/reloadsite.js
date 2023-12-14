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

var socketURL = `ws://localhost:{{PORT}}`;
var timeoutIntVal;

function start(isReloaded = false) {
  start.isConnecting = true;

  var socket = new WebSocket(socketURL);

  socket.onopen = function () {
    console.info('LiveReload Connected');
    start.isConnecting = false;
    // always reload if re-connection is made
    if (isReloaded) {
      window.location.reload();
    }
  };

  socket.onclose = function (event) {
    console.warn(
      event.wasClean
        ? 'LiveReload Disconnected'
        : 'LiveReload Connection break: ' + (event.reason || event.code)
    );

    start.isConnecting = false;
    reconnect();
  };

  socket.onerror = function (err) {
    console.error('LiveReload Error', err.message || '');
    start.isConnecting = false;
    reconnect();
  };

  socket.onmessage = function (e) {
    let data = JSON.parse(e.data);

    //for style and images, we try
    if (data.HMRMethod == 'linkChange') {
      let tags = document.querySelectorAll('link[rel="stylesheet"], img');

      for (var tag of tags) {
        var attrName;

        if (tag && tag instanceof HTMLElement) {
          if (tag.tagName.toLowerCase() == 'link') {
            attrName = 'href';
          } else {
            attrName = 'src';
          }

          var urlFileName = tag[attrName].replace(/\?ts=.+$/, '');
          if (urlFileName.endsWith(data.fileName)) {
            tag[attrName] = urlFileName + '?ts=' + Date.now();
          }
        }
      }
    }
    // otherwise we just reload page
    else {
      window.location.reload();
    }
  };
}

function reconnect() {
  reconnect.retries = reconnect.retries || 1;
  reconnect.wait = reconnect.wait || 500;

  clearTimeout(timeoutIntVal);

  if (reconnect.retries >= 20) {
    console.error(
      'Unable to recconnect to ' +
        socketURL +
        ' after ' +
        reconnect.retries +
        ' retries!'
    );
    return;
  }

  timeoutIntVal = setTimeout(() => {
    reconnect.retries++;
    reconnect.wait = Math.ceil(reconnect.wait * 1.15);
    start(true);
  }, reconnect.wait);
}

start();
