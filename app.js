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

const { createServer } = require('http'),
  chokidar = require('chokidar'),
  fs = require('fs'),
  path = require('path'),
  server = createServer(),
  ws = require('ws'),
  debug = require('debug-symbols')('ReloadSite'),
  EventEmitter = require('events');

let JSFIleData;
let timeoutIntVal;

let styleExtensions = [
  // Styles
  'css',
];

let imageExtensions = [
  // Images:source https://github.com/mdn/content/blob/main/files/en-us/web/media/formats/image_types/index.md
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
  // web scripts
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

class Watcher extends EventEmitter {
  constructor(opts) {
    super();

    this.opts = Object.assign({ port: 35729 }, opts);

    this.connections = {};
  }

  start_server() {
    let self = this;

    const wss = new ws.Server({ server });

    wss.on('connection', function (ws) {
      // add connections so we can broadcast
      self.connections[ws.id] = ws;

      function log() {
        debug.log(
          `${Object.keys(self.connections).length} clients connected...`
        );
      }

      ws.on('data', function (message) {
        ws.write(message);
      });

      ws.on('close', function () {
        if (ws.id in self.connections) {
          delete self.connections[ws.id];
          log();
        }
      });

      log();
    });

    server.on('request', (req, res) => {
      if (req.url.indexOf('/reloadsite.js') == 0) {
        const headers = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
          'Access-Control-Max-Age': 2592000,
          'content-type': 'application/javascript;',
        };

        let file = path.join(__dirname, './script/reloadsite.js');

        // read file once
        if (!JSFIleData) {
          JSFIleData = fs
            .readFileSync(file, 'utf-8')
            .replace('{{PORT}}', this.opts.port);
        }

        res.writeHead(200, headers);

        res.end(JSFIleData);
      } else {
        res.end('');
      }
    });

    server.listen(this.opts.port, function () {
      debug.log(`ReloadSite Listening to Port: ${self.opts.port}`);
    });
  }

  watch(dirs, opts = {}) {
    if (typeof opts !== 'object') {
      throw new Error(
        'Chokidar options must be an object. See: https://www.npmjs.com/package/chokidar#api'
      );
    }

    this.watchOpts = Object.assign(
      {
        persistent: true,
        autoReload: true,
        delay: 1000,
        // always ignore node_modules
        ignored: /node_modules/,
        extensions: [
          ...styleExtensions,
          ...imageExtensions,
          ...scriptExtensions,
        ],
      },
      opts
    );

    // console.log(opts);
    // console.log(this.watchOpts.extensions);

    // make array and globs to watch only specific files
    dirs = arrify(dirs).filter((p) => path.resolve(p));

    let patterns = dirs.map((dir) =>
      path.join(dir, `**/*.{${this.watchOpts.extensions.join(',')}}`)
    );

    // filter dirs
    this.start_server();

    // console.log(this.watchOpts);

    let watcher = chokidar.watch(patterns, this.watchOpts);

    watcher
      .on('change', (f) => this.changed(f))
      .on('unlink', (f) => this.changed(f));
  }

  changed(file) {
    debug.log({ file });

    this.emit('changed', file);

    if (this.watchOpts.autoReload) {
      this.reload(file);
    }
  }

  async reload(file = null) {
    let HMRMethod = 'reload';
    let fileName = null;

    // use timeout to simulate some kind of debouncing for reloads where many files change at within a very little time
    clearTimeout(timeoutIntVal);

    timeoutIntVal = setTimeout(() => {
      debug.log('reloading');
      this.emit('reloaded', this.opts.port);

      // if we have a file
      if (file) {
        //   determine file type
        let ext = path.extname(file).slice(1);
        //   determine reload method based on extensipon type
        HMRMethod =
          styleExtensions.includes(ext) || imageExtensions.includes(ext)
            ? 'linkChange'
            : 'reload';

        fileName = path.basename(file);
      }

      //   construct the object we want to send
      const data = {
        file,
        fileName,
        HMRMethod,
      };

      // debug.log(this.connections);
      for (let id in this.connections) {
        this.connections[id].send(JSON.stringify(data));
      }
    }, 500);
  }
}

function arrify(v) {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

module.exports = (opts = {}) => new Watcher(opts);
