/**
 * Created by andy on 2018/8/20.
 */

PageBuilder.register('block2', {
	onLoad: function(block, depends) {
		block.emit('hello', 'all', '大家好');

		PageBuilder.on('block2', 'hello3', function(source, msg) {
			console.info(`${source} say ${msg} to ${this.name}`);
		});
		PageBuilder.emit('hello3', 'block2', 'block1', '你好呀');
	},
	render: function(domId, block, depends) {
		let dom = document.getElementById(domId);
		dom.innerText = block.name;
	},
	onStart: function(block, depends) {
		console.info('on start');
	},

	onStop: function(block, depends) {
		console.info('on stop');
		PageBuilder.off('block1', 'hello3');
	},

	onClear: function(block, depends) {
		console.info('on clear');
	},
});
