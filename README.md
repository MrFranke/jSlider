jSlider
=======

Галлерея с огромным колличеством настроек.
Умеет быть верикальной и горизонтальной, можно передать собственную функцию для анимации и подключить пагинацию.


```javascript
$('.slider').jSlider(options, true); // option - объект опций, true - указывает что слайдер должен быть вертикальным
```
```html
<div class="js-slider"> <!--Обертка слайдера-->
    <div class="">
        <div class="js-slider_review_overflow"> <!--Обертка для списка основных картинок-->
            <ul class="js-slider_review"> <!--Список картинок-->
                
               <li class="js-slider_review_item">
                    <img src="http://fpoimg.com/650x360?text=1">
                    <a href="path/to/foolscreen.jpg" class="js-slider_fullscreen"></a> <!--Кнопка для foolscreen-a не обязательна-->
                </li>
            </ul>
        </div>
    </div>  
    <div class="slider-list-wrapper"> <!--Список превью-->
        <div class="slider-list-wrapper-bg"></div>
    
        <div class="js-slider_nav_prev"></div>  <!--Инструменты управления-->
        <div class="js-slider_nav_next"></div>
        
        <div class="js-slider_preview_overflow">
            <ul class="js-slider_preview">                  
                <li class="js-slider_preview_item">
                    <img src="http://fpoimg.com/145x90?text=1"><!--Превью-->
                </li>
            </ul>
        </div>
    </div>
</div>
```
Параметры слайдера:
```javascript
{
      SLIDER_CSS_CLASS: 'js-slider' // Класс для слайдера. Если такой класс уже есть, его можно переопределить
    , animation: false              // Анимирует перелистывание картинок (может принемать функцию)
    , autoRatating: false           // Автоматическое перелистывание (принимает значение в миллисекундах)
    , activEl: 1                    // Элемент, который будет активным при инициализации слайдера
    , alignment: true               // Автоматическое выравниывние элементов (все превью должны быть одного размера)
    , review: true
    , rotator: true
    , pagination: false
    , visableElements: 4                     // Колличество видимых на странице элементов
    , step: verticalDirection ? 1 : 4        // Если вертикальный слайдер, то перематываем одну картинку (если не указанно другое)
    , slideOnLastFirstEl: !verticalDirection // Крутит слайдер при нажатии на крайние превью в видемой части списка
    , maxDiffForImageRotating: 5             // Если пользователь прокрутит больше картинок, то запускается альтернативая анимация прокрутки
    , fullscreen: false                      // Инициализация colorbox'a. Можно передать объект настроек colorbox'a
}
```

Для слайдера необхдим colorbox, даже если foolscreen не используется.

**TODO:**

- Добавить бесконечную прокрутку.
- Добавить возможность подгрузки картинок AJAX-ом
- Сделеть ресайз галереи
- Убрать жесткую зависимость от colorbox-а
- Перенести опцию направления слайдера в объект параметров
