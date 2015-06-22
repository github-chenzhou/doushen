({
	appDir: "./",
	baseUrl: "js",
	dir: "../built",
	paths: {
		// Libraries
		'jquery.lazyload': 'lib/jquery.lazyload-1.8.4-min',
		juicer: 'lib/juicer-0.6.5',
		ajax: 'modules/util/ajax',
		ajaxform: 'modules/util/ajaxform'
	},
	shim: {
		juicer: {
			exports: 'juicer'
		}
	},
	modules: [
	]
})