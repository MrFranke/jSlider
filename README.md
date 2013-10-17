jSlider
=============

**jSlider** - многофункциональная галлерея, основанная на AMD структуре. 
Его приемущество перед остальными слайдерами состоит в гибкой настройке
и возможности легко встраевать свои модули для расширения функционала.

Все взаимодействия между модулями основанно на событиях, которые генерирует [роутер](https://github.com/MrFranke/jSlider/blob/amd/src/jquery.jslider.js),
это значт что можно легко отслеживать работу слайдеа и расширять функциональность, подписываясь на [события](https://github.com/MrFranke/jSlider/wiki/%D0%A1%D0%BE%D0%B1%D1%8B%D1%82%D0%B8%D1%8F)
роутера.

Так же роутер умеет обрабатывать битые каритнки, удаляя их из общего списка. Это позволяет избежать проблем
с отображением битых ссылок в слайдере.

**jSlider рассчитан на поддержку**: IE7+, Chrome, FF, Opera.

### Быстрый деплой:
**html:**
```html
<div class="js-slider">
      <!--Список со всеми слайдами-->
      <ul class="js-slider__frames__list">
          <li><img src="http://fpoimg.com/650x360?text=1"></li>
          <li><img src="http://fpoimg.com/650x360?text=2"></li>
          <li><img src="http://fpoimg.com/650x360?text=3"></li>
          <li><img src="http://fpoimg.com/650x360?text=4"></li>
          <li><img src="http://fpoimg.com/650x360?text=5"></li>
          <li><img src="http://fpoimg.com/650x360?text=6"></li>
          <li><img src="http://fpoimg.com/650x360?text=7"></li>
      </ul>
      <!--Список со всеми превью-->
      <ul class="js-slider__preview__list">
          <li><img src="http://fpoimg.com/105x90?text=1"></li>
          <li><img src="http://fpoimg.com/105x90?text=2"></li>
          <li><img src="http://fpoimg.com/105x90?text=3"></li>
          <li><img src="http://fpoimg.com/105x90?text=4"></li>
          <li><img src="http://fpoimg.com/105x90?text=5"></li>
          <li><img src="http://fpoimg.com/105x90?text=6"></li>
          <li><img src="http://fpoimg.com/105x90?text=7"></li>
      </ul>
  </div>
```
**javascript:**
```javascript
require([
    'jquery',
    'jquery.jslider'
], function($, jSlider) {
    $('.js-slider').jSlider({
        skin: 'standart'
    });
});
```

### Список модулей:
* [Frames](https://github.com/MrFranke/jSlider/wiki/Frames) - кадры слайдера. Нужны для обображения полноразмерных фотографий.
* [Preview](https://github.com/MrFranke/jSlider/wiki/Preview) - превью для слайдера. Нужны для упрощения навигации по слайдера
* [Pagination](https://github.com/MrFranke/jSlider/wiki/Pagination) - пагинация для слайдера. Нужна для дублирования превью.
* [Touch](https://github.com/MrFranke/jSlider/wiki/Touch) - модуль, позволяющий управлять кадрами и превью слайдера с помощью свайпа.
* [Skins](https://github.com/MrFranke/jSlider/wiki/Skins) - этот модуль отвечает за шаблоны стлайдера
