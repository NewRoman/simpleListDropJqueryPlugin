# simpleListDropJqueryPlugin

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
