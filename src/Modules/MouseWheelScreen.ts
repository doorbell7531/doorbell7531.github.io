/* ***************************************************************************
 * Summary: 滾輪捲動整頁
 * Author: Doorbell
 * ************************************************************************** */
import '../../node_modules/jquery.easing';

export class MouseWheelScreen
{
    private static isEnabled:boolean;   //啟動旗標
    private static isScrolling:boolean; //捲動中旗標

    private static _duration:number = 500;              //捲動時間
    private static _easing:string = 'easeOutCubic';     //緩動函數
    private static _fullScreenOnly:boolean = true;      //滿版時才啟動
    private static _onScrollInit:Function = null;       //捲動開始處理器
    private static _onScrollComplete:Function = null;   //捲動完成處理器

    //#region 開放方法
    /**
     * 啟動
     * @static
     * @memberof MouseWheelScreen
     */
    public static Enable():void
    {
        if(!this.isEnabled)
        {
            this.OnMouseWheelHandler = this.OnMouseWheelHandler.bind(this);
            window.addEventListener('mousewheel', this.OnMouseWheelHandler, {passive:false});
            this.isEnabled = true;
        }
    }

    /**
     * 不啟動
     * @static
     * @memberof MouseWheelScreen
     */
    public static Disable():void
    {
        window.removeEventListener('mousewheel', this.OnMouseWheelHandler);
        this.isEnabled = false;
    }

    /**
     * 捲動視窗
     * @private
     * @static
     * @param {number} toTop 目標位置
     * @memberof MouseWheelScreen
     */
    public static ScrollTo(toTop:number):void
    {
        this.isScrolling = true;

        if(this.onScrollInit != null)
            this.onScrollInit();

        $('html').stop(true, false).animate({ 'scrollTop': toTop }, this.duration, this.easing, () =>
        {
            this.isScrolling = false;

            if(this.onScrollComplete != null)
                this.onScrollComplete();
        });
    }

    //#endregion

    /**
     * 滾輪事件處理器
     * @private
     * @static
     * @param {WheelEvent} e 滾輪事件
     * @returns {void}
     * @memberof MouseWheelScreen
     */
    private static OnMouseWheelHandler(e:WheelEvent):void
    {
        if(this.fullScreenOnly)
        {
            //滿版判斷
            if($(window).outerWidth() == screen.width)
                e.preventDefault();
            else
                return;
        }
        else
        {
            e.preventDefault();
        }

        if (this.isScrolling) return;

        const nowTop: number = $(window).scrollTop();
        const windowHeight:number = $(window).innerHeight();
        const mul: number = nowTop / windowHeight;
        
        if (e.deltaY > 0) //向下
        {
            if (this.MatchTop(nowTop))
                this.ScrollTo(nowTop + windowHeight);
            else
                this.ScrollTo(windowHeight * Math.ceil(mul));
        }
        else if(e.deltaY < 0)    //向上
        {
            if (this.MatchTop(nowTop))
                this.ScrollTo(nowTop - windowHeight);
            else
                this.ScrollTo(windowHeight * Math.floor(mul));
        }
    }

    /**
     * 當前卷軸高度吻合視窗高度
     * @private
     * @static
     * @param {number} nowTop
     * @returns {boolean}
     * @memberof MouseWheelScreen
     */
    private static MatchTop(nowTop:number):boolean
    {
        return (nowTop % $(window).innerHeight() == 0);
    }

    //#region getter/setter

    /** 捲動時間(ms) */
    public static set duration(val:number){
        this._duration = val;
    }
    public static get duration():number{
        return this._duration;
    }

    /** jquery 緩動函數 */
    public static set easing(val:string){
        this._easing = val;
    }
    public static get easing():string{
        return this._easing;
    }

    /** 限制滿版時才啟動 */
    public static set fullScreenOnly(val:boolean){
        this._fullScreenOnly = val;
    }
    public static get fullScreenOnly():boolean{
        return this._fullScreenOnly;
    }

    /** 捲動開始處理器 */
    public static set onScrollInit(val:Function){
        this._onScrollInit = val;
    }
    public static get onScrollInit():Function{
        return this._onScrollInit;
    }

    /** 捲動完成處理器 */
    public static set onScrollComplete(val:Function){
        this._onScrollComplete = val;
    }
    public static get onScrollComplete():Function{
        return this._onScrollComplete;
    }
    
    //#endregion
}