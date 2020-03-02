/**
 * Created by andy on 2018/8/20.
 */

(function() {
	const loadFiles = function(files) {
		const count = files.length;
		if (count == 0) {
			return new Promise((resolve, reject) => {
				resolve();
			});
		}

		const ps = [];
		const timestamp = `${new Date().getTime()}`;

		for (let i = 0, len = files.length; i < len; i += 1) {
			let f = files[i];
			const isCss = f.indexOf('!css') === 0;
			if (isCss) {
				f = f.substring(4);
			}

			const isAbs = f.indexOf('!abs') === 0;
			let path = isAbs ? f.substring(5) : f;
			if (path.indexOf('/') == 0) {
				path = path.substring(1);
			}

			path += `?_${timestamp}`;

			const head = document.getElementsByTagName('head')[0];

			var ele;
			if (isCss) {
				ele = document.createElement('link');
				ele.rel = 'stylesheet';
				ele.href = path;
			} else {
				ele = document.createElement('script');
				ele.type = 'text/javascript';
				ele.src = path;
			}

			const promise = new Promise((resolve, reject) => {
				if (ele.readyState) {
					ele.onreadystatechange = function() {
						if (
							ele.readyState == 'loaded' ||
							ele.readyState == 'complete'
						) {
							resolve();
						}
					};
				} else {
					ele.onload = function(e) {
						resolve();
					};
				}

				head.appendChild(ele);
			});

			ps.push(promise);
		}
		return Promise.all(ps);
	};

	const loadDependencies = (block, builder) => {
		const depends = block.dependencies;
		const ps = [];
		for (let i = 0, count = depends.length; i < count; i = i + 1) {
			const promise = builder.load(depends[i]);
			ps.push(promise);
		}

		return Promise.all(ps);
	};

	const findBlocks = (names = [], blocks) => {
		const bs = [];
		for (let i = 0, len = names.length; i < len; i = i + 1) {
			const block = blocks[names[i]];
			bs.push(block);
		}
		return bs;
	};

	const callEvent = (eventName, block, source, data) => {
		block.events[eventName] &&
			block.events[eventName].call(block, source, data);
	};

	const Block = function(config, builder) {
		config = config || {};
		this.name = config.name;
		this.dependencies = config.dependencies || [];
		this.files = config.files || [];
		this.state = 'ready';
		this.builder = builder;
		this.events = config.events || {};
		this.domId = config.domId || '';
		this.timers = {};

		if (this.builder.debug) {
			console.info(`Block[${this.name}] define`);
		}
	};

	Block.prototype = {
		// 调用所注册的start方法,可用于激活定时器等, 直接调用不发送全体广播
		start() {
			console.info(`Block[${this.name}] start`);
			if (this.onStart) {
				const depends = findBlocks(
					this.dependencies,
					this.builder.blocks,
				);
				this.onStart(this, depends);
			}
		},

		// 调用所注册的stop方法,可用于清除定时器、请求等, 直接调用不发送全体广播
		stop() {
			console.info(`Block[${this.name}] stop`);
			if (this.onStop) {
				const depends = findBlocks(
					this.dependencies,
					this.builder.blocks,
				);
				this.onStop(this, depends);
			}
		},

		// 清除Block,会把该block注册的event清除
		clear() {
			if (this.builder.debug) {
				console.info(`Block[${this.name}] clear`);
			}

			this.stop();
			const dom = document.getElementById(this.domId);
			if (dom) {
				dom.innerHTML = '';
			}

			this.events = {};

			if (this.onClear) {
				this.onClear();
			}
		},

		// 添加监听事件
		on(name, event) {
			this.events[name] = event;
			if (this.builder.debug) {
				console.info(`Block[${this.name}] add event ${name}`);
			}
		},

		// 移除监听事件
		off(name) {
			this.events[name] = null;

			if (this.builder.debug) {
				console.info(`Block[${this.name}] remove event ${name}`);
			}
		},

		// 发起广播, target为all时通知所有Block
		emit(eventName, target, data) {
			if (this.builder.debug) {
				console.info(
					`Block[${this.name}] emit event[${eventName}] to ${target}`,
				);
			}

			this.builder.broadcast(this.name, target, eventName, data);
		},

		// 渲染Block到dom
		renderTo(domId) {
			this.domId = domId || this.domId;
			if (this.state == 'loaded') {
				if (this.render) {
					const depends = findBlocks(
						this.dependencies,
						this.builder.blocks,
					);
					this.render(this.domId, this, depends);
					console.info(
						`Block[${this.name}] render to #${this.domId}`,
					);
				} else {
					console.info(`Block[${this.name}] render is empty`);
				}
			}
		},
	};

	const PageBuilder = function() {
		this.blocks = {};
		this.loadFile = {};
		this.debug = false;
	};

	PageBuilder.prototype = {
		// 批量定义Block, 远程加载服务端注册的配置，实现微服务模式
		init(blocks) {
			blocks = blocks || [];
			for (let i = 0, len = blocks.length; i < len; i += 1) {
				const b = blocks[i];
				this.define(b);
			}
		},

		// 定义Block
		define(config) {
			if (
				!config ||
				typeof config.name !== 'string' ||
				config.name === ''
			) {
				console.error('Name of Page Block is wrong!');
				return;
			}

			const { name } = config;
			if (this.blocks[name]) {
				console.warn(`Page Block is exist! -----  ${name}`);
				return;
			}

			const block = new Block(config, this);
			this.blocks[name] = block;
		},

		// 注册Block方法，也就是Block的入口, events为生命函数onLoad/onStart/onStop/onClear/render
		register(name, events) {
			const block = this.blocks[name];
			if (!block) {
				console.error(`Page Block is not defined! -----  ${name}`);
				return;
			}

			for (let a in events) {
				if (typeof events[a] === 'function') {
					block[a] = events[a];
				}
			}
		},

		// 加载完毕后,返回promise参数为(block, depends)
		load(name) {
			const that = this;
			const block = that.blocks[name];
			if (!block) {
				return new Promise((resolve, reject) => {
					reject(`Block ${name} is not defined!`);
				});
			}
			return new Promise((resolve, reject) => {
				const cb = function() {
					that.loadFile[name] = true;
					block.state = 'loaded';
					const depends = findBlocks(block.dependencies, that.blocks);
					that.broadcast(
						name,
						'all',
						'loaded',
						`Block[${name}] loaded`,
					);

					if (block.onLoad) {
						block.onLoad(block, depends);
					}

					resolve(block, depends);
				};

				if (block.state == 'loaded' || this.loadFile[name]) {
					cb();
				} else if (block.state == 'ready') {
					block.state = 'loading';
					if (block.dependencies && block.dependencies.length > 0) {
						loadDependencies(block, that).then(() => {
							loadFiles(block.files).then(() => {
								cb();
							});
						});
					} else {
						loadFiles(block.files).then(() => {
							cb();
						});
					}
				}
			});
		},

		// 添加监听事件
		on(name, eventName, event) {
			const block = this.blocks[name];
			if (block) {
				block.on(eventName, event);
			}
		},

		// 删除监听事件
		off(name, eventName) {
			const block = this.blocks[name];
			if (block) {
				block.off(eventName);
			}
		},

		// 发起广播, target为all是通知所有Block
		emit(eventName, source, target, data) {
			source = source || 'PageBuilder';
			let { blocks } = this;

			if (target !== 'all' && this.blocks[target]) {
				const bs = {};
				bs[target] = this.blocks[target];
				blocks = bs;
			}

			for (const b in blocks) {
				if (b != source) {
					callEvent(eventName, blocks[b], source, data);
				}
			}
		},

		// 启动block, 发送全体广播
		startBlock(name) {
			const block = this.blocks[name];
			if (block) {
				block.start();
				this.emit('start', name, 'all', `Block[${name}] start`);
			}
		},

		// 停止block, 发送全体广播
		stopBlock(name) {
			const block = this.blocks[name];
			if (block) {
				block.stop();
				this.emit('stop', name, 'all', `Block[${name}] stop`);
			}
		},

		// 清除block, 会把该block注册的event清除
		clearBlock(name) {
			const block = this.blocks[name];
			if (block) {
				block.clear();
			}
		},

		// 开启调试模式，打印调用过程
		enableDebug(enable) {
			this.debug = !!enable;
		},

		// 设置共享数据
		setState(states) {
			this.states = { ...this.states, ...states };
		},

		// 获取共享数据
		getState(key) {
			return this.states[key];
		},

		// 更新浏览器title
		updateTitle(title) {
			document.title = title;
		},
	};

	window.PageBuilder = new PageBuilder();
})();
