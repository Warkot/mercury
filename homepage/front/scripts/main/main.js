

let Globals = require('./globals'),
	parallaxWindow = $('#js-parallax-window');;

$(function () {
	if (parallaxWindow.length) {
		parallax();

		$(window).scroll((e) => {
			parallax();
		});
	}

	$('.carousel').slick({
		arrows: true,
		dots: false,
		infinite: false,
		speed: 300,
		slidesToShow: 2,
		centerMode: false,
		variableWidth: true
	});

	// Dynamically adjust text size to show community title without text break.
	// bigText adjusts the size programatically and strips off css padding, so it is
	// necessary to add it in explicitly afterwards
	var headings = $('.grid-heading');
	headings.bigText({maximumFontSize: 20, verticalAlign: 'top'});
	headings.css({padding: '.1rem'});

	globals = new Globals();
});

function parallax() {
	if (parallaxWindow.length > 0) {
		var plxBackground = $('#js-parallax-background'),
		    plxWindow = $('#js-parallax-window'),
		    plxWindowTopToPageTop  = $(plxWindow).offset().top,
		    windowTopToPageTop = $(window).scrollTop(),
		    plxWindowTopToWindowTop = plxWindowTopToPageTop - windowTopToPageTop,
		    plxBackgroundTopToPageTop  = $(plxBackground).offset().top,
		    windowInnerHeight = window.innerHeight,
		    plxBackgroundTopToWindowTop = plxBackgroundTopToPageTop - windowTopToPageTop,
		    plxBackgroundTopToWindowBottom = windowInnerHeight - plxBackgroundTopToWindowTop,
		    plxSpeed = 0.5;

		plxBackground.css('top', -(plxWindowTopToWindowTop * plxSpeed) + 'px');
	}
}

$('#beginnersGuide').click((event) => {
	window.location.href = '/beginners';
	event.preventDefault();
});

$('.search-wikia-form').submit((event) => {
	search();
	event.preventDefault();
});

$('.search-wikia').click((event) => {
	search();
	event.preventDefault();
});

$('#loginIcon').click((event) => {
	if ($(document).width() < 710) {
		$('#userInfoToggle').toggle();
	} else {
		window.location.href = globals.getLoginUrl();
	}

	event.preventDefault();
});

$('#whatIsWikia').click((event) => {
	window.location.href = '/beginners';
	event.preventDefault();
});

function search()  {
	var searchText,
		searchUrl;

	searchText = encodeURI($('#searchWikiaText').val());

	if (!searchText) {
		// search button for mobile is different element
		searchText = encodeURI($('#searchWikiaTextMobile').val());
	}

	if (searchText) {
		searchUrl = 'http://ja.wikia.com/Special:Search?search=';
		searchUrl += searchText;
		searchUrl += '&fulltext=Search&resultsLang=ja';

		window.location.href = searchUrl;
	}
}
