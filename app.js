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
	sockjs = require('sockjs'),
	chokidar = require('chokidar'),
	fs = require('fs'),
	path = require('path'),
	aproba = require('aproba'),
	server = createServer(),
	wss = sockjs.createServer({ log: (s) => null }),
	debug = require('debug')('ReloadSite'),
	EventEmitter = require('events');

let JSFIleData;

class Watcher extends EventEmitter {
	constructor(opts) {
		super();

		this.opts = Object.assign({ port: 35729 }, opts);

		this.connections = {};
	}

	start_server() {
		let self = this;

		wss.installHandlers(server, { prefix: '/ws' });

		wss.on('connection', function (ws) {
			// add connections so we can broadcast
			self.connections[ws.id] = ws;

			function log() {
				debug(
					`${
						Object.keys(self.connections).length
					} clients connected...`
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
				let file = path.join(__dirname, './script/reloadsite.js');

				if (!JSFIleData) {
					JSFIleData = fs
						.readFileSync(file, 'utf-8')
						.replace('{{PORT}}', this.opts.port);
				}

				res.writeHead(200);

				res.end(JSFIleData);
			} else {
				res.end('');
			}
		});

		server.listen(this.opts.port, function(){
            debug(`ReloadSite Listening to Port: ${self.opts.port}`);
        });
	}

	watch(dirs, opts = {}) {
		aproba('AO|A', arguments);

		this.watchOpts = Object.assign(
			{
				persistent: true,
                autoReload:true,
				extensions: [
					'html',
					'css',
					'js',
					'png',
					'gif',
					'jpg',
					'php',
					'php5',
					'py',
					'rb',
					'erb',
					'coffee',
				],
			},
			opts
		);

		// console.log(opts);
		// console.log(this.watchOpts);

		// filter dirs
		this.start_server();

		let watcher = chokidar.watch(dirs, opts);

		watcher
			.on('change', (f) => this.changed(f))
			.on('unlink', (f) => this.changed(f));
	}

	changed(file) {
		debug({ file });

		this.emit('changed', file);

        if(this.watchOpts.autoReload){
            this.reload();
        }
		
	}

	async reload(delay = 0) {
		aproba('N|', arguments);

		delay = this.watchOpts.delay || delay;

		await new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, delay);
		});

		debug('reloading');
        this.emit('reloaded', this.opts.port);

		// debug(this.connections);
		for (let id in this.connections) {
			this.connections[id].write('reload');
		}
	}
}

module.exports = (opts = {}) => new Watcher(opts);
