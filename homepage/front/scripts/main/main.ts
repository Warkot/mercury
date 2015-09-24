/// <reference path="../../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../../typings/slick/slick.d.ts" />

'use strict';

declare var getGlobals : any;

var parallaxWindow : JQuery = $('#js-parallax-window');

$(function() : void {
	if (parallaxWindow.length) {
		parallax();

		$(window).scroll(function(e) : void {
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
});

function parallax() : void {
	if (parallaxWindow.length > 0) {
		var plxBackground = $('#js-parallax-background'),
		    plxWindow = $('#js-parallax-window'),
		    plxWindowTopToPageTop : number = $(plxWindow).offset().top,
		    windowTopToPageTop = $(window).scrollTop(),
		    plxWindowTopToWindowTop = plxWindowTopToPageTop - windowTopToPageTop,
		    plxBackgroundTopToPageTop : number = $(plxBackground).offset().top,
		    windowInnerHeight : number = window.innerHeight,
		    plxBackgroundTopToWindowTop : number = plxBackgroundTopToPageTop - windowTopToPageTop,
		    plxBackgroundTopToWindowBottom : number = windowInnerHeight - plxBackgroundTopToWindowTop,
		    plxSpeed : number = 0.5;

		plxBackground.css('top', - (plxWindowTopToWindowTop * plxSpeed) + 'px');
	}
}

$('#beginnersGuide').click(function(event) : void {
	window.location.href = '/beginners';
	event.preventDefault();
});

$('.search-wikia-form').submit(function(event) : void {
	search();
	event.preventDefault();
});

$('.search-wikia').click(function(event) : void {
	search();
	event.preventDefault();
});

$('#loginIcon').click(function(event) : void {
	if ($(document).width() < 710) {
		$('#userInfoToggle').toggle();
	} else {
		window.location.href = getGlobals().loginUrl;
	}

	event.preventDefault();
});

$('#whatIsWikia').click(function(event) : void {
	window.location.href = '/beginners';
	event.preventDefault();
});

function search() : void {
	var searchText : string,
		searchUrl : string;

	searchText = encodeURI($('#searchWikiaText').val());

	if (!searchText) {
		// search button for mobile is different element
		searchText = encodeURI($('#searchWikiaTextMobile').val());
	}

	if (searchText) {
		searchUrl = '/search?q=' + searchText;

		window.location.href = searchUrl;
	}
}
