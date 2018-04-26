/**
    Created by Roman Gorbunov on 24.04.17.
    простой плагин для работы c выпадающими списками (вместо плагина select2 для списков select
    пришлось написать свой плагин так как select2 имеет особенности которые ограничивают возможности по работе
     с списками + из 6000 строк плагина select2 мы использовали максимум строк 300)

     ** LESS стили для плагина описаны в файле common-styles/te/header/ _simple-list-drop.less

    разметка должна быть следующей***
    для нормальной работы плагина обязательно наличие таких класов и атрибутов:
    **.simple-list-drop-container - главный блок с необходимой разметкой(основная разметка прописываеться вручную и не генерируеться плагином)
    **role="show-list-drop" - елемент c названием выбраного элеметна ()
    **.simple-list-drop - выпадающий список с списком опций
    **.simple-list-item - каждая отдельная опция из выпадающего списка 
    **.active.simple-list-item - выбраная опция из выпадающего списка
    **[data-simpledrop-thumb] - элемент с миниатюрой которую неоходимо показать возле названия выбраного элемента(данный блок должен быть во всех элементах списка) 
    **input.active-status - поле где будет отображаться текст выбраного элемента
    **input.active-status[disabled] - если поиск по списку не активирован то скрптом добавляеться аттрибут disabled
    **[data-no-match-found] - элемент списка который будет показан если после поиска по списку совпадения не найдены

    <div class="simple-list-drop-container">

        <div class="list-drop-active" role="show-list-drop">
            если надо показывать возле названия миниатюру то плагин вставляет сюда еще такой блок 
            <span data-simpledrop-thumb class="thumb"> данный блок отсутсвует изначально в верстке и вставляеться сюда плагином 
                тут должна быть картинка
            </span>
            этот блок копируеться с выбраного элемента выпадающего списка
            т.е. если надо чтобы была показана миниатюра возле текста то необходимо чтобы блок с картинкой был в элементах выпадающего списка
            <input type="text" class="active-status" value='' >
            **изначально value=''(плагин методом showActiveElTextInStatus вставляет сюда значение data-simpledrop-text из выбраного .active.simple-list-item)
        </div> 

        ** список с списком опций
        <ul class="simple-list-drop">
        ** класом active помечаеться выбраный елемент в списке
            <li class="simple-list-item active"
                data-simpledrop-value="ft"
                data-simpledrop-text="ft">
                ft
            </li>
            <li class="simple-list-item "
                data-simpledrop-value="sq.m"
                data-simpledrop-text="sq.m">
                sq.m
            </li>
            <li class="simple-list-item "
                data-simpledrop-value="sq.m"
                data-simpledrop-text="sq.m"
                data-no-match-found>
                sq.m
            </li>
        </ul>
    </div>

    **  подключение плагина
        $('.simple-list-drop-container').simple_list_drop()

    ** методы которые можно использовать из внешнего кода (API плагина)
        $('.simple-list-drop-container').simple_list_drop(имя_метода)
        методы: showListDrop - показывает выпадающий список
                hideListDrop - прячет выпадающий список

    события генерируемые плагином:
    **  change_active.simple-list-drop
        использование в коде
        $('.simple-list-drop-container').on('change_active.simple-list-drop', function(){
            console.log('изменился активный элемент списка')
        });
    **  hide.simple-list-drop
        использование в коде
        $('.simple-list-drop-container').on('hide.simple-list-drop', function(){
            console.log('список simple-list-drop был спрятан')
        });
    **  show.simple-list-drop
        использование в коде
        $('.simple-list-drop-container').on('show.simple-list-drop', function(){
            console.log('список simple-list-drop был показан')
        });
 **/


 //@TODO организовать логику таким образом чтобы в верстке формировать только список елементов, а все остальные блоки (которые его обертывают) геренировать скриптом


// плагин написан по патерну описаному тут 
// ***https://www.smashingmagazine.com/2011/10/essential-jquery-plugin-patterns/#a-highly-configurable-and-mutable-plugin ***
;(function( $, window, document, undefined ){
	
	// plugin constructor
    var SimpleListDrop = function( elem, options ){
		this.elem = elem;
        this.$elem = $(elem);
        this.indexOfVisibleItems = 0;// индекс который используеться при навигации по выпадающему списку когда используем клавиатуру (используеться только когда searchInList: true)
        this.$currentItem;// текущий элемент выпадающего списка при навигации с помощью клавиатуры(используеться только когда searchInList: true)
		this.options = typeof options  === 'object' ? options : {};
	};
    
    // все функции плагина записываем в прототип конструктора чтобы они были доступны через this в обьєкте плагина
	SimpleListDrop.prototype = {
        // настройки по умолчанию
		defaults: {
            listDropBlockSelector: '.simple-list-drop-container',    // селектор контейнера с выпадающим списком
            isThumbnailShow: false, // в блоке role="show-list-drop" с текстом активного элемента показывать картинку(например флаг), для того чтобы картинка была показана необходимо установить в true и добавить в елемент списка simple-list-item тег с data-simpledrop-thumb и класом thumb(например <span data-simpledrop-thumb class="thumb">тут картинка должна быть</span> )
            activeElTextStatusSelector: '[role="show-list-drop"]',// елемент в котором отображаеться выбраный елемент и thumbnail (если isThumbnailShow: true)
            searchInList: false,
        },

        // log: function(text) {
        //     if ( $('.log').length <= 0  ) {
        //         $('<div/>', {"class": 'log', "css": {'margin-top':'40px'}}).insertBefore('#main');
        //     }
        //     $('<h5/>', {'css': {"display":"block"}}).html(text).appendTo($('.log'));
        // },
	
		init: function() {
            this.config = $.extend(true, {}, this.defaults, this.options);

            var self = this;
            var $elem = this.$elem;
            var options = this.config;

            // при инициализации показываем выбраные елементы
            this.showActiveElTextInStatus($elem);

            /**
             * если поиск по списку не надо активировать то при клике по полю запретить фокусировку и появление курсора в нем.
             * вариант с readonly отлично отрабатывает везде кроме мообильных(в iOS поле все равно получает фокус - курсор в поле мигает, но сама клавиатура не появляеться)
             * вариант с $(this).blur() отрабатывает но на iOS появляються мерцания экрана, так как на долю секунды клавиатура все равно появляеться
             * оставил рабочий вариант с disabled - так как тут все коректно отрабатывает, но пришлось добавить ХАК для отмены стилей (в стилях) по умолчанию полей с disabled в iOS 
             */
            if ( !options.searchInList ) {

                // для IE для применения к инпуту свойства text-overflow: ellipsis необходимо добавить атрибут readonly
                // https://codepen.io/gapcode/pen/vEJNZN
                if ( navigator.userAgent.indexOf('Edge')/* MS Edge */ !== -1 || navigator.userAgent.indexOf('Trident/')/* MS IE11 */ !== -1 || navigator.userAgent.indexOf('MSIE')/* MS IE10 and older */ !== -1 ) { 
                    $elem.find('input').attr('readonly', 'readonly');
                } else {
                    $elem.find('input').attr('disabled', 'disabled');
                }

                var $disableInput = $elem.find("input")

                // в FF клик по input не всплывает поэтому приходиться создавать псевдоелемент и ловить клик от него, идея взята отсюа
                // чтобы избежать проблем с кроссбраузерностью при клике и стилизации инпута добавим поверх него псевдоелемент и будем ловить клик от него, идея взята отсюа
                // https://blog.pengoworks.com/index.cfm/2010/4/23/Attaching-mouse-events-to-a-disabled-input-element
                var $parent = $elem.find(options.activeElTextStatusSelector);
                var $overlay = $('<div />');
                $overlay.css({
                    // position the overlay in the same real estate as the original parent element 
                    position: "absolute"
                    , top: '0'
                    , left: '0'
                    , width: '100%'
                    , height: $parent.outerHeight()
                    , zIndex: 43
                    // IE needs a color in order for the layer to respond to mouse events
                    , backgroundColor: "#fff"
                    // set the opacity to 0, so the element is transparent
                    , opacity: 0
                    })
                    // attach the click behavior
                //   .click(function (){
                //     // trigger the original event handler
                //     return $disableInput.trigger("click");
                //   })
                    ;
            
                // add the overlay to the page  
                $parent.append($overlay);
               
                
                // $elem.find('input').attr('readonly', 'readonly');
                // $elem.find('input').on('focus', function(event){
                //     $(this).blur();
                //     event.stopImmediatePropagation();
                // });
            }
            var event = typeof window.orientation != 'undefined' ? 'touchend.simple-list-drop' : 'click.simple-list-drop';
  
            // закрыть списки если кликнуть в любом другом месте страницы
            $(document).on('click.simple-list-drop', function(e){
                // self.log('event IN document')
                $(e.target).closest(options.listDropBlockSelector+'.active').length == 0 ? self.hideListDrop() : false;
            });
 
            // показ выпадающего списка
            $elem.on(event, options.activeElTextStatusSelector, function(e){
                
                e.stopImmediatePropagation();
                // при наличии класа disabled ничего не делать( клас disabled скрывает стрелку справа и делает курсор default )
                if ( $(this).hasClass('disabled') ) return;
 
                // запустить событие открытия выпадающего списка
                var startShowingListDrop = $.Event('start_showing_list.simple-list-drop');
                $elem.trigger(startShowingListDrop, [$elem]); 

                if ($elem.hasClass('active')) {
                    setTimeout(function(){
                        self.hideListDrop($elem);
                    }, 100);
                } else {
                    setTimeout(function(){
                        self.showListDrop();
                    }, 100);
                }
                // self.log(event + '   IN   ' + options.activeElTextStatusSelector)
            });

            // клик по элементу выпадающего списка (выбор активного параметра)
            $elem.on('click.simple-list-drop', '.simple-list-item', function(e){
                e.stopImmediatePropagation();
                // self.log('выбор активного параметра')
                if (!$(this).hasClass('active')) $elem.find('.simple-list-drop>.active').removeClass('active');;

                $(this).addClass('active');

                // если в списке есть несколько одинаковых элементов то поставить галочку возле обоих !!ХАК для списка стран
                var text = String($(this).data('simpledrop-text'));
                if ( $elem.find( 'ul>' + '[data-simpledrop-text="' +  text + '"]' ) != undefined && $elem.find( 'ul>' + '[data-simpledrop-text="' +  text + '"]' ).length > 1 ) {
                    $elem.find( 'ul>' + '[data-simpledrop-text="' +  text + '"]' ).addClass('active');  
                }

                self.showActiveElTextInStatus($elem);
                self.hideListDrop($elem);

                // запустить событие смены активного элемента
                var changeActiveEvent = $.Event('change_active.simple-list-drop');
                $elem.trigger(changeActiveEvent, [$elem]); 
                
                self.showAllItems();
            });
            
            if ( options.searchInList ) {
            
                $elem.on('keyup.simple-list-drop', 'input', function(event){
                    
                    event.stopImmediatePropagation();
                    $elem.addClass('typed'); // клас typed необходим для того чтобы отслеживать событие выбора активного элемента - если выбор был произведен то клас удаляеться
                    var keyCode = self._getKeyCode(event);
                    var $this = $(this);
                    var inputValue = $this.val();
                    var $listItems = $elem.find('ul>li');

                    if ( !self.isChar( inputValue ) ) {
                        if ( keyCode == 39 || keyCode == 37 || keyCode == 8 ) return;
                        inputValue = inputValue.slice(0, -1);
                        $this.val( inputValue );
                    }

                    // приводим к нижнему регистру для того чтобы провести поиск совпадений введенных символов с элементами в списке
                    inputValue = inputValue.toLowerCase();
                    
                    var $listItemsVisible = $elem.find('ul>li.simple-list-item:visible');
                    
                    var listItemsVisibleLength = $listItemsVisible.length;
                    if ( keyCode == 40 ) {// кнопка вниз
                        if ( listItemsVisibleLength == 0 || self.indexOfVisibleItems == listItemsVisibleLength ) return;
                        if ( self.indexOfVisibleItems > 0 ) {
                            $($listItemsVisible[self.indexOfVisibleItems-1]).removeClass('highlight');
                        } 
                        $($listItemsVisible[self.indexOfVisibleItems]).addClass('highlight');
                        self.$currentItem = $($listItemsVisible[self.indexOfVisibleItems]);
                        self.indexOfVisibleItems++;
                        
                    } else if ( keyCode == 38 ) { // кнопка вверх
                        self.indexOfVisibleItems <= 1 ? 0 : self.indexOfVisibleItems--;
                        if ( listItemsVisibleLength <= 0 || self.indexOfVisibleItems == 0 ) return;
                        $($listItemsVisible[self.indexOfVisibleItems]).removeClass('highlight');// удаляем подсветку с предыдущего элемента
                        $($listItemsVisible[self.indexOfVisibleItems-1]).addClass('highlight');// добавляем подсветку текущему элементу
                        self.$currentItem = $($listItemsVisible[self.indexOfVisibleItems-1]);
                    } else if ( keyCode == 27 ) {// кнопка escape
                        // self.hideListDrop();
                        $elem.find(options.activeElTextStatusSelector).trigger('click.simple-list-drop');
                    } else if ( keyCode == 13 ) {// кнопка enter
                        self.$currentItem.trigger('click.simple-list-drop');
                    } else {
                        var noMatchFound = false;
                        $listItems.each(function(){
                            var itemText = $(this).data('simpledrop-text') ? $(this).data('simpledrop-text').toLowerCase() : '';
                         
                            var regExpInputValue = new RegExp( '^' + inputValue, 'i');// ищем совпадения только по первым символам
                           
                            $(this).addClass('hide');
                            
                            if ( itemText.match( regExpInputValue ) && !$(this).hasClass('js-popular-country') ) {// !!!ХАК - !$(this).hasClass('js-popular-country') необходимо для того чтобы в списке стран не дублировались страны при поиске по набраному тексту
                                $(this).removeClass('hide');
                                if ( noMatchFound == false ) noMatchFound = true;// меняем только один раз
                            } 
                        });

                        // если не было найдено ни одного совпадения то показать дефолтный элемент(если он задан в верстке)
                        if ( !noMatchFound ) {
                            $elem.find('li[data-no-match-found]').length > 0 ? $elem.find('li[data-no-match-found]').removeClass('hide') : false;
                        }

                        self.indexOfVisibleItems = 0;
                    }

                    // показать все скрытые елементы
                    if ( inputValue == '' ) {
                        $listItems.removeClass('hide');
                        return;
                    }
                });

                 /**
                 * рабочий вариант для iOS 9 - iphone 6
                 */
                // var eventForSelectText = typeof window.orientation != 'undefined' ? 'touchstart.simple-list-drop' : 'click.simple-list-drop';
                // $elem.find('input').on(eventForSelectText, function (e) { 
                //     if ( $elem.hasClass('active') ) return;
                //     e.stopImmediatePropagation();
                //     this.setSelectionRange(0, 9999);
                //     return false; //наличие этой строки помогает избежать зума при фокусе в инпуте
                // } );
  
                var eventForSelectText = typeof window.orientation != 'undefined' ? 'touchstart.simple-list-drop' : 'click.simple-list-drop';
                if (navigator.userAgent.indexOf('OS 6') !== -1) {
                    eventForSelectText = 'touchend.simple-list-drop';
                } 
                $elem.find('input').on(eventForSelectText, function (e) { 
                    // self.log(navigator.userAgent)
                    if ( $elem.hasClass('active') ) return; 
                    // e.stopImmediatePropagation();
                    if ( navigator.userAgent.indexOf('Android ') !== -1 ) {
                        $(this).select();
                    } else {
                        this.setSelectionRange(0, 9999);
                    }
                    // self.log(eventForSelectText + '   IN INPUT'); 
                } );


            }
            
		    return this;
        },

        // разрешаем вводить только буквеные символы
        isChar: function( value ){
            var regex = /^[a-zA-Z]*$/;
            return regex.test( value );
        },

        _getKeyCode: function(event) {
            var keycode;
            if (!event) {
                event = window.event;
            }
            if (event.keyCode) {
                keycode = event.keyCode; // IE
            } else if (event.which) {
                keycode = event.which; // all browsers
            }
            return keycode;
        },

        showAllItems: function($elem) {
            var $elem = $('.simple-list-drop-container.active')
            // при выборе активного элемента показать все элементы которые были спрятаны при фильтрации списка по введеному тексту
            if ( $elem.hasClass('typed') ) {
                $elem.removeClass('typed');
                setTimeout(function(){
                    $elem.find('ul>li').removeClass('hide');
                },200);
            }
        },
        
        // открыть выпадающий список
        showListDrop:  function() {
            var self = this;
            var $elem = this.$elem;
            var options = this.config;
            
            // при открывании другого выпадающего списка скрыть остальные
            self.hideListDrop();

            var showListDropEvent = $.Event('show.simple-list-drop');
            $elem.trigger(showListDropEvent, [$elem]);
                
            $elem.addClass('active');
            $elem.find('.simple-list-drop').fadeIn('fast');
            // проскролить список до активного элемента
            $elem.hasClass('active') ? $elem.find('.simple-list-drop').scrollTop($elem.find('.simple-list-drop>li.active').position().top) : false;

        },
    
        // отобразить выбраный элемент
        // взять из списка елемент с класом active и поместить его текст в блок role="show-list-drop"
    	showActiveElTextInStatus: function() {
            var $elem = this.$elem;
            var options = this.config; 
            var $activeElTextStatusBlock = $elem.find(options.activeElTextStatusSelector);
            var $activeEl = $elem.find('.simple-list-drop>.active').first();
           
            $activeElTextStatusBlock.find('input').val( $activeEl.data('simpledrop-text') );
            // if ( options.searchInList ) $activeElTextStatusBlock.find('input').focus(); // ХАК для iOS 6 чтобы при клике на инпут текст в нем выделялся
            // значение data-simpledrop-value активного елемента списка запишем в data-val єлемента .simple-list-drop-container
            // чтобы избежать лишних манипуляций с ДОМ для поиска актвного элемента в списке
            $elem.attr('data-simpledrop-val-active', $activeEl.data('simpledrop-value'));
            $elem.data('simpledrop-val-active', $activeEl.data('simpledrop-value'));

             // если в елементах списка есть картинка то не показывать ее в блоке с отображением выбраного(с класом active) елемента списка
            !options.isThumbnailShow && !$activeElTextStatusBlock.hasClass('no-img') ? $activeElTextStatusBlock.addClass('no-img') : false;
            
            // если в активном блоке отсутсвует элемент с картинкой или отображать картинку не надо то дальше ничего не делаем
            if ( !options.isThumbnailShow || $activeEl.find('[data-simpledrop-thumb]').length == 0 ) return;
             
            // скопировать елемент с картинкой в блок с отображением статуса(если в статусе необходимо показывать картинку)
            // возле текста слева картинка должна быть показана
            if ( !!$activeElTextStatusBlock.find('[data-simpledrop-thumb]') ) $activeElTextStatusBlock.find('[data-simpledrop-thumb]').remove();
            $activeElTextStatusBlock.prepend( $activeEl.find('[data-simpledrop-thumb]').clone() );
        },
        
        // закрыть выпадающий список
        hideListDrop: function($elemArgs) {
            var self = this;
            var $elem =  $elemArgs == undefined ? $('.simple-list-drop-container.active') : this.$elem;

            // запустить событие пропадания списка
            var hideListDropEvent = $.Event('hide.simple-list-drop');
            $elem.trigger(hideListDropEvent, [$elem]);

            var $input = $elem.find('input');
            if ( $elem.hasClass('typed') ) {
                $input.val( $elem.find('.simple-list-item.active').first().data('simpledrop-text') );
                self.showAllItems($elem);
            } 

            setTimeout(function(){
                $input.blur();
                // $(document).off('click.simple-list-drop')
                $elem.find('.simple-list-drop').fadeOut('fast');
                $elem.removeClass('active');
            }, 100);

            $elem.find('.simple-list-item.highlight').removeClass('highlight');
            self.$currentItem = null;
            self.indexOfVisibleItems = 0;
        },
	}
	
	SimpleListDrop.defaults = SimpleListDrop.prototype.defaults;
	
	$.fn.simple_list_drop = function(options) {
		return this.each(function() {
            // для иницализации плагина
            if ( typeof options === 'object' || !options ) {
                new SimpleListDrop(this, options).init();
            // для вызова метода плагина
            } else if ( typeof options === 'string' && SimpleListDrop.prototype[options] ) {
                new SimpleListDrop(this, options)[options]();
            }
		});
	};
	// optional, see here http://markdalgleish.com/2011/05/creating-highly-configurable-jquery-plugins/
	// window.SimpleListDrop = SimpleListDrop;
	
})( jQuery, window , document );