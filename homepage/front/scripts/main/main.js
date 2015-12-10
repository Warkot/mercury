import {loadGlobalData, getLoginUrl} from './globals';

/**
 * @returns {void}
 */
function search() {
	let searchText = encodeURI($('#searchWikiaText').val());

	if (!searchText) {
		// search button for mobile is different element
		searchText = encodeURI($('#searchWikiaTextMobile').val());
	}

	if (searchText) {
		window.location.href = `http://ja.wikia.com/Special:Search?search=${searchText}&fulltext=Search&resultsLang=ja`;
	}
}

$(() => {
	const headings = $('.grid-heading');

	$('.hero-carousel').slick({
		arrows: false,
		dots: true,
		autoplay: true,
		autoplaySpeed: 3000,
		slidesToShow: 1,
	});

	// Move previous/next arrow elements inside hero-carousel.
	// This must be done after initializing slick, otherwise the buttons will
	// be treated as slides
	$('.hero-prev').detach().appendTo('.hero-carousel');
	$('.hero-next').detach().appendTo('.hero-carousel');

	$('.featured-carousel').slick({
		arrows: false,
		dots: false,
		slidesToShow: 4,
		slidesToScroll: 4,
		responsive: [
			{
				breakpoint: 1140,
				settings: {
					slidesToShow: 3,
					slidesToScroll: 3,
				}
			},
			{
				breakpoint: 865,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 2
				}
			},
			{
				breakpoint: 615,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1
				}
			}
		]
	});

	// TODO: The carousels should be encoded in a json file
	$('#carousel-1-prev').detach().appendTo('#carousel-1');
	$('#carousel-1-next').detach().appendTo('#carousel-1');
	$('#carousel-2-prev').detach().appendTo('#carousel-2');
	$('#carousel-2-next').detach().appendTo('#carousel-2');
	$('#carousel-3-prev').detach().appendTo('#carousel-3');
	$('#carousel-3-next').detach().appendTo('#carousel-3');

	// Dynamically adjust text size to show community title without text break.
	// bigText adjusts the size programatically and strips off css padding, so it is
	// necessary to add it in explicitly afterwards
	headings.bigText({maximumFontSize: 20, verticalAlign: 'top'});
	headings.css({padding: '.1rem'});

	loadGlobalData();
});

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

$('.hero-prev').click(function () {
	const id = $(this).attr('id'),
		carousel = $(`#${id}`).parent().attr('id');

	$(`#${carousel}`).slick('slickPrev');
});

$('.hero-next').click(function () {
	const id = $(this).attr('id'),
		carousel = $(`#${id}`).parent().attr('id');

	$(`#${carousel}`).slick('slickNext');
});

$('#loginIcon').click((event) => {
	if ($(document).width() < 710) {
		$('#userInfoToggle').toggle();
	} else {
		window.location.href = getLoginUrl();
	}

	event.preventDefault();
});

$('#whatIsWikia').click((event) => {
	window.location.href = '/beginners';
	event.preventDefault();
});
