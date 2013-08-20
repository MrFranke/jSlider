jQuery(document).ready(function($) {
	$('.slider').jSlider({visableElements:3, step:1, resizeble: true});

	$('.slider__vertical').jSlider({alignment: true}, true);
});
