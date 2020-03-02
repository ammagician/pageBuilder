/**
 * Created by andy on 2018/8/20.
 */

PageBuilder.enableDebug(true);

PageBuilder.define({
	name: 'block1',
	files: [
		'blockContent.js',
		'!css/blockContent.css',
		'!abs/https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/js/lib/jquery-1.10.2_d88366fd.js',
	],
	dependencies: [],
	events: {
		hello: function(source, msg) {
			console.info(source + ' say ' + msg + ' to ' + this.name);
		},
	},
});

PageBuilder.load('block1').then(
	(block, deps) => {
		block.renderTo('one');
		block.start();
	},
	err => {
		console.error(err);
	},
);

PageBuilder.define({
	name: 'block2',
	files: ['blockContent2.js'],
	dependencies: ['block1'],
	events: {
		hello: function(source, msg) {
			console.info(source + ' say ' + msg + ' to ' + this.name);
		},
	},
	domId: 'two',
});

PageBuilder.load('block2').then(
	(block, deps) => {
		block.on('hello', function(source, msg) {
			console.info(source + ' say ' + msg + ' to ' + this.name);
		});
		block.renderTo();
	},
	err => {
		console.error(err);
	},
);

PageBuilder.define({
	//模块名称，需要保证唯一
	name: 'block3',
	//模块脚本文件，CSS使用!css/开头，外网脚本使用!abs/开头
	files: [],
	//模块依赖
	dependencies: [],
	//监听事件，同addEventListener。可选
	events: {
		hello: function(source, msg) {
			console.info(source + ' say ' + msg + ' to ' + this.name);
		},
	},
	//渲染目标dom。可选。如果没有渲染要求，则为非界面的一个Block
	domId: '',
});
