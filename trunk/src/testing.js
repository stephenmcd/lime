
Base.require('Events');
Base.require('Json');
Base.require('Http');
Base.require('Session');
Base.require('Panels');
Base.require('Console');

var tester = new Tester('Terry Testosterone, The Testy Tasting Tester');
var iframe = new IFrame('iframe');

//**********************************************************************

function Tester(name) {

	var o = this;
	var _icons = {};

	o.name = name ? name : (Math.floor(Math.random()) == 1 ? 'Mr' :  'Ms') + ' No Name';
	o.emotions = ['Happy', 'Sad', 'Angry'];
	
	o.icons = function(name) {

		var icons;

		if (!_icons[name]) {icons = document.getElementsByTagName('img');}
		if (icons) {
			for (var i = 0; i < icons.length; i++) {
				if (icons[i].src.substr(icons[i].src.lastIndexOf('/') + 1).split('.')[0] == name) {
					_icons[name] = icons[i];
				}
			}
			if (_icons[name]) {
				_icons[name].style.cursor = 'pointer';
				if (!_icons[name].getAttribute('id')) {_icons[name].setAttribute('id', name);}
			}
		}

		return _icons[name];

	}

	o.getMood = function() {
		return o.name + ' is ' + o.emotions[Math.floor(Math.random() * o.emotions.length)];
	}
	
	o.addMoodHandler = function(button, msg) {
		Base.Events.add(button, 'onclick', function() {
			Base.Console.echo(o.getMood() + ' and says: ' + msg);
			return true;
		});
	}
	
	o.addUrlHandler = function(button, url) {
		Base.Events.add(button, 'onclick', function() {
			Base.Http.send(url);
			Base.Console.echo(name + ' surfed to: ' + url);
			return true;
		});
	}

	o.peekAt = function(obj) {

		var rv = [];

		for (var k in obj) {
			try {
				switch (typeof obj[k]) {
					case 'string' :
					case 'boolean' :
					case 'number' :
						rv[rv.length] = k + ': ' + String(obj[k]).substr(0, 40);
						break;
					default :
						rv[rv.length] = k + ': ' + String(typeof obj[k]).toUpperCase();
						break;
				}
			} catch (err) {
				rv[rv.length] = k + ': ERR ' + err.message;
			}
		}

		Base.Console.echo(o.name + ' peeking :\n\n' + rv.sort().join('\n'));

	}

}

//**********************************************************************

Base.onLoad = function() {

	this.Console.start();
	this.Console.attachTo('iframe');

	this.Http.onRequestLoad = function() {
		Base.Console.echo('\n' + this.id + '\n' + this.url + '\n' + escape(this.text.substr(0, 50)) + '\n');
	}
	
	this.Events.add(document.getElementsByTagName('h1')[0], 'onclick', function() {
		location.reload();
	});

	this.Events.add(tester.icons('console'), 'onclick', function() {
		Base.Console.clear();
		Base.Console.toggle();
	});

	this.Events.add(tester.icons('note'), 'onclick', function() {
		iframe.load(document.location + 'dat/dat.txt');
	});

	this.Events.add(tester.icons('spell'), 'onclick', testAnimations);
	
	tester.addMoodHandler(tester.icons('weather'), 'hi');
	tester.addMoodHandler(tester.icons('weather'), 'bye');

	tester.addUrlHandler(tester.icons('rss'), document.location + 'dat/dat.txt');
	tester.addUrlHandler(tester.icons('rss'), document.location + 'dat/dat.htm');				

	testAnimations();

}

//**********************************************************************

function testAnimations(icon) {

	var icons = document.getElementsByTagName('img');
	var randIcons = [];
	var startOpacity = 0, endOpacity = 100;

	if (Base.getType(icon) == 'array') {
		Base.Panels.panel(Base.getIdAttr(icons[icon.shift()])).fade(startOpacity, endOpacity, function() {
			if ((icon.length > 0)) {
				testAnimations(icon);
			} else {
				Base.Panels.panel(Base.getIdAttr(document.getElementsByTagName('div')[0])).fade(startOpacity, endOpacity);
			}
		});				
	} else if (isNaN(icon)) {
		Base.Panels.panel(Base.getIdAttr(document.getElementsByTagName('h1')[0])).fade(startOpacity, endOpacity, function() {
			if ((icons.length > 0)) {testAnimations(0);}
		});				
	} else {
		Base.Panels.panel(Base.getIdAttr(icons[icon])).fade(startOpacity, endOpacity, function() {
			if (icon < icons.length - 1) {
				testAnimations(icon + 1);
			} else {
				for (var i = 0; i < icons.length - 1; i++) {randIcons[i] = i;}
				testAnimations(randIcons.shuffle());
			}
		});
	}

}

//**********************************************************************
