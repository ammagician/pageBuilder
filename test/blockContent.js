/**
 * Created by andy on 2018/8/20.
 */
PageBuilder.register('block1', {
	onLoad: function(block, depends) {
		block.on('hello2', function(source, msg) {
			console.info(`${source} say ${msg} to ${this.name}`);
		});

		block.emit('hello', 'block2', '你好');
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
		block.off('hello');
	},

	onClear: function(block, depends) {
		console.info('on clear');
	},
});
