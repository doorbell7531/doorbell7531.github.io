/* ***************************************************************************
 * Summary: 拼圖遊戲
 * Author: Doorbell
 * **************************************************************************/
import * as $ from "jquery";
import { Swappable, MirrorCreatedEvent, DragStopEvent } from "@shopify/draggable";
import { TweenMax, TimelineLite, Back, Power4 } from "gsap/TweenMax";

export default class Jigsaw
{
    private atlas: HTMLImageElement;

    private $parent:JQuery;
    private $loading:JQuery;
    private $container: JQuery;
    private $pieces: JQuery;

    private draggable: Swappable;

    private piecesWidth:number;
    private callback:Function;

    /**
     * 建構式
     * @param {JQuery} $parent 父容器
     * @param {string} src 圖片來源
     * @param {Function} [callback=null] 完成後事件 (default:null)
     * @param {number} [cols=3] 欄數 (default:3)
     * @param {number} [rows=3] 列數 (default:3)
     * @memberof Jigsaw
     */
    constructor($parent: JQuery, src: string, callback:Function = null, cols: number = 3, rows: number = 3)
    {
        
        if ($parent == undefined || $parent.length == 0 || src == undefined || src == "")
            throw new Error('[Jigsaw constructor] 未指定父容器或圖片來源');

        this.$parent = $parent;
        this.callback = callback;

        //顯示loading
        this.$loading = $('<div />', { class: 'jigsaw-loading' }).appendTo(this.$parent);

        this.atlas = new Image();

        //圖片載入完成事件
        this.atlas.onload = () =>
        {
            this.$loading.remove();  //移除loading

            this.Init(cols, rows);
            this.SetDraggable();
            this.RandomSort();

            // this.OrderSort();
            // this.OnCompleteHandler();
        }

        //載入圖片
        this.atlas.src = src;
    }

    //#region 開放方法 ******************************************************************

    /**
     * 隨機排列
     *
     * @returns
     * @memberof Jigsaw
     */
    public RandomSort()
    {
        if(this.$pieces.length <= 1) return;

        let counter:number = 0;
        let isSorted:boolean = false;
        const sortAry:number[] = [];

        for(let i = 0; i < this.$pieces.length; i++)
            sortAry.push(i);
    
        //打亂排列
        for(let i = 0; i < sortAry.length; i++)
        {
            let tempVal = sortAry[i];
            let rdmIndex = Math.round(Math.random() * (sortAry.length - 1));
            sortAry[i] = sortAry[rdmIndex];
            sortAry[rdmIndex] = tempVal;
        }

        //檢查打亂結果
        isSorted = sortAry.every((val) =>
        {
            counter ++;
            return (val == counter - 1) ? true : false;
        });

        if(!isSorted)
        {
            sortAry.forEach((val)=>{
                this.$container.append(this.$pieces.eq(val));   //執行打亂結果
            })

            this.$pieces = this.$container.children('li');  //更新參照
        }
        else
        {
            this.RandomSort();  //再次隨機排列
        }
    }

    /**
     * 依序排列
     *
     * @memberof Jigsaw
     */
    public OrderSort()
    {
        for(let i = 0; i < this.$pieces.length - 1; i++)
        {
            for(let j = 0; j < this.$pieces.length - 1 - i; j++)
            {
                let sort_1 = this.$pieces.eq(j).attr('data-sort'),
                    sort_2 = this.$pieces.eq(j + 1).attr('data-sort');

                if(sort_1 > sort_2)
                {
                    this.$pieces.eq(j).insertAfter(this.$pieces.eq(j + 1));
                    this.$pieces = this.$container.children('li');  //更新參照
                }
            }
        }
    }

    //#endregion

    //#region 私有方法 ******************************************************************

    /**
     * 初始化
     *
     * @private
     * @param {number} cols 欄數
     * @param {number} rows 列數
     * @memberof Jigsaw
     */
    private Init(cols:number, rows:number)
    {
        //切割圖片
        const pieceWidth = this.atlas.naturalWidth / cols;
        const pieceHeight = this.atlas.naturalHeight / rows;
        const piecesSrcAry:string[] = [];

        for(let i = 0; i < rows; i++)
        {
            for(let j = 0; j < cols; j++)
            {
                const canvas = document.createElement('canvas');
                canvas.width = pieceWidth;
                canvas.height = pieceHeight;

                const context = canvas.getContext('2d');
                context.drawImage(this.atlas, j * pieceWidth, i * pieceHeight, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);

                piecesSrcAry.push(canvas.toDataURL());
            }
        }

        //建立拼圖結構
        this.$container = $('<ul></ul>', {class:'jigsaw-container'});
        this.piecesWidth = 100 / cols;
        piecesSrcAry.forEach((src, index)=>
        {
            $('<li></li>',{'data-sort':index, 'width': this.piecesWidth + '%'}).append('<img class="onHover" src="' + src +'">').appendTo(this.$container);
        });
        this.$pieces = this.$container.children('li');

        //載入圖片資源
        /* this.$pieces.children('img').each(function(i)
        {
            $(this).one('load', () => {
                //圖片全部載入完成事件
            });

            $(this).attr('src', piecesSrcAry[i]);
        }); */

        //加入拼圖
        this.$parent.append(this.$container);
    }

    /**
     * 設定拼圖功能
     *
     * @private
     * @memberof Jigsaw
     */
    private SetDraggable()
    {
        this.draggable = new Swappable(this.$container.get(0), {
            'draggable': 'li',
            'mirror': {
                'constrainDimensions': true
            },
            'classes': {
                'mirror':'mirror',
                'source:dragging':'onDragging',
            }

            /* 'plugins': [Draggable.Plugins.SwapAnimation],
            'swapAnimation':{
                horizontal: true,
                easingFunction: 'ease-in-out'
            }, */
        });

        this.draggable.on('mirror:created', this.OnMirrorCreated);
        this.draggable.on('drag:stop', this.OnStopDrag.bind(this));
    } 

    /**
     * 鏡像建立完成事件
     * 
     * @private
     * @param {MirrorCreatedEvent} e 事件
     * @memberof Jigsaw
     */
    private OnMirrorCreated(e:MirrorCreatedEvent)
    {
        const $mirror = $(e.data.mirror); //鏡像物件
        const $spread = $('<div></div>', {class:'puzzle-mirror-spread'}); //擴散效果物件

        $mirror.prepend($spread);

        //設定行內樣式
        $spread.css({
            'position':'absolute',
            'width': '100%',
            'height': '100%',
            'left': '0', 'top': '0',
            'background': 'rgba(255, 255, 255, 0.2)',
            'z-index': '1'
        });

        //設定動畫
        TweenMax.to($mirror.children('*'), 0.2, {
            transform: 'perspective(100rem) rotateX(30deg)',
            boxShadow: '0px 25px 30px -3px rgba(0, 0, 0, .6)',
            ease:Back.easeOut,
            easeParams:[2]
        });

        TweenMax.fromTo($mirror.children('img'), 0.2,{ filter: "brightness(1)"}, { filter: "brightness(1.5)"});

        TweenMax.fromTo($spread, 0.5,
            {scale:0, alpha:0},
            {scale:1, alpha:1, ease:Power4.easeOut, onComplete:()=>{
            TweenMax.to($spread, 0.2, {alpha:0});
        }});
    }

    /**
     * 拖曳結束事件
     *
     * @private
     * @param {DragStopEvent } e 事件
     * @memberof Jigsaw
     */
    private OnStopDrag(e:DragStopEvent)
    {
        /* 
        - setTimeout的堆疊順序在後，可避免取得多餘的元素 (mirror, source)
        - from: https://github.com/Shopify/draggable/issues/92
        */
        setTimeout(() =>
        {
            this.$pieces = $(e.data.sourceContainer.children);  //更新參照

            //檢查排序
            let isSorted = true;
            this.$pieces.each(function (index)
            {
                if($(this).attr('data-sort') != index.toString())
                {
                    isSorted = false;
                    return;
                }
            });

            if(isSorted)
                this.OnCompleteHandler();
                
        }, 0);
    }

    /**
     * 拼圖完成事件
     *
     * @private
     * @memberof Jigsaw
     */
    private OnCompleteHandler()
    {
        this.draggable.destroy();
        this.$pieces.children('img').removeClass('onHover');   //清除滑入樣式

        //設定行內樣式
        this.$container.css({
            'position':'relative',
            'z-index':'1'
        });
        this.$pieces.css({
            'position':'relative'
        });
        this.$pieces.children('img').css({
            'position':'relative',
            'z-index':'-1'
        });

        //設定動畫
        let tll = new TimelineLite().stop();
        
        //圖片依序發亮
        tll.add(() =>
        {
            tll.pause();

            const instance = this;
            this.$pieces.each(function (index)
            {
                TweenMax.fromTo($(this).children('img'), 0.15,
                    {filter:'brightness(1)'},
                    {
                        filter:'brightness(2)',
                        delay:(index * 0.05),
                        yoyo:true,
                        repeat:1,
                        onComplete:() =>
                        {
                            if(index == instance.$pieces.length - 1) tll.resume();
                        }
                    }
                );
            });
        });
        
        //全圖片發亮 & 內光暈
        tll.add(() =>
        {
            tll.pause();

            TweenMax.fromTo(this.$pieces.children('img'), 0.5,
                {filter:'brightness(1)'},
                {
                    filter:'brightness(2.5)',
                    ease:Power4.easeInOut,
                    yoyo:true,
                    repeat:1,
                }
            );

            TweenMax.to(this.$pieces, 0.5,
                {
                    boxShadow: 'inset white 0 0 3px 2px, inset white 0 0 30px 1px',
                    ease:Power4.easeInOut,
                    yoyo: true,
                    repeat:1,
                    onComplete: () => {tll.resume();}
                }
            );
        });

        //清除行內樣式
        tll.add(()=>{
            this.$container.find('*').removeAttr('style');
            this.$container.removeAttr('style');
            this.$pieces.css({'width': this.piecesWidth + '%'});
        });

        tll.play();

        if(this.callback != null) this.callback();
    }

    //#endregion
}