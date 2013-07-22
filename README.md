jSlider
=======

Галерея с огромным колличеством настроек.
Умеет быть верикальной и горизонтальной, можно передать собственную функцию для анимации и подключить пагинацию.

Поддерживает touch events


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
    , animation: true              // Анимирует перелистывание картинок (может принемать функцию, которая срабатывает при изменении параметра)
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
API
===
Опции, которые можно передать слайдеру в объекте settings. 

Например:
```javascript
var options = {
      autoRatating: 5000
    , activEl: 10
    , visableElements: 2
}

$('.slider').jSlider(options);
```


SLIDER_CSS_CLASS ('.js-slider')
---

Это класс, от которого отталкивается слайдер для поиска элементов необходимых ему для работы. Стандартное значение *.js-slider*, 
но его можно поменять, если этот класс уже занят.

animation (true)
---

Эта опция включает и выключает анимацию при перелистывании картинки слайдера. 
Так же она может принимать функцию в виде параметра, которую будет вызывать вместо стандартной анимации:
```javascript
var options = {
    // Заменяем стандартную анимацию слайдера на о-о-о-о-о-очень медренную
    animation: function ( $list, $activeEl, diff, newIndex ) {
        $list.animate({ top: -$activeEl.position().top }, 10000);
    }
}

$('.slider').jSlider(options);
```

Callback принемает несколько аргументов:
- ***$list*** {Object} jQuery элемент <ul> в котором содержатся все картинки
- ***$activeEl*** {Object} Элемент, который стал активным
- ***diff*** {Number} колличество элементов, между старым активным и новым
- ***newIndex*** {Number} Новый индекс активного элемента


autoRatating (false)
---

Включает автоматическое перелистывание слайдера. Принемает true/false или значение в миллисекундах. 
Если значение true - зажержка при перелистывании 5000мс.

activEl (1)
---

Номер активного элемента (не индекс!).
При загрузке пролистывает слайдер к нужному элементу

visableElements (4)
---
Колличество видимых превью. Нужно для выравнивания превью или для правильного отслеживания первого и последнего 
элемента в видимой области.

alignment(true, у вертикального слайдера false)
---
Автоматическое выравнивание элементов по ширине видимой области превью слайдера.
Не работает в вертикальном слайдере. Ширина всех превьюшек должна быть одинаковой.

review (true)
---
Включает/отключает фунционал больших изображений в слайдере. Если false, то отключает стрелки и перелистывание

rotator (true)
---
Включает/отключает фунционал превью слайдера. Если false, то не работают стрелки в превью, 
не перелистываются превьюшки и не меняют активный элемент

pagination (false)
---
Включает/отключает пагинацию. Если true, то создается список со всеми картинками слайдера

step ( если горизонтальный слайдер, то 4, если вертикальный то 1 )
---
Шаг смещения видимой области превью. Определяет то, на сколько превью сместиться видимая область за одно смещение

slideOnLastFirstEl ( true, у вертикального слайдера false )
---
Если true, то отлавливает состояние первого и последнего видимого элемента превью. 
Как только они станут активными, смещает видимую область превь на 1 элемент в нужную сторону

maxDiffForImageRotating (5)
---
Колличество картинок, на которое слайдер переключает с анимацией, если нужно перематать картинок больше чем
maxDiffForImageRotating, то анимация отключается и следующая активная картинка просто "появляется" на месте предыдущей.

Это может понадобиться для того, что бы слайдер не пролистывал большое колличество картинок с анимацией 
и не заставлял пользователя ждать. Ну и заодно экономит память на больших галереях.

fullscreen (false)
---
Опция включает возможность работы с colorbox. Для работы опции нужен элемент js-slider_fullscreen в слайдере

motionlessPreview (false)
---
Отключает движение видимой области превью. Может пригодиться в слайдерах, в которых все прьевью видны сразу

preloadCallback (null)
---
Функция, которая вызывается сразу после инициализации слайдера

changeActiveElCallback (null)
---
Функция, которая вызывается во время смены активного элемента


Для слайдера необхдим colorbox, даже если foolscreen не используется.

**TODO:**

- Добавить бесконечную прокрутку.
- Добавить возможность подгрузки картинок AJAX-ом
- Сделеть ресайз галереи
- Убрать жесткую зависимость от colorbox-а
- Перенести опцию направления слайдера в объект параметров
