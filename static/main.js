jQuery(document).ready(function($) {
	$('.slider').jSlider({visableElements:3, step:1, resizable: true});

	$('.slider__vertical').jSlider({alignment: true}, true);
});
