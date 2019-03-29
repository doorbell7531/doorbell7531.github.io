/* ***************************************************************************
 * Summary: 卷軸目標觸發事件
 * Author: Doorbell
 * Usage:
 * 
 *  const targetAry:Target[] = [
        new Target($selector),
        new Target($selector),
        new Target($selector)
    ];
    targetEvt.AddTargets(...targetAry);

 * **************************************************************************/

export class ScrollTargetEvent
{
    private targetAry:Target[];
    
    constructor()
    {
        this.targetAry = new Array<Target>();
        
        //加入卷軸事件
        $(window).scroll(()=>{
            this.DetectTriggerEvt();
        });
    }

    /**
     * 增加目標物件
     * @param {...Target[]} targets
     * @memberof ScrollTargetEvent
     */
    public AddTargets(...targets:Target[])
    {
        targets.forEach(target =>
        {
            if(!this.HasSameTarget(target))
            {
                this.targetAry.push(target);
                if(target.initEvt != null) target.initEvt();
            }
            else
                console.warn("[ScrollTargetEvent AddTarget] 目標已存在: " + target.$anchor.get(0).outerHTML);
        });

        this.DetectTriggerEvt();
    }

    /**
     * 移除目標
     * @param {...Target[]} targets
     * @memberof ScrollTargetEvent
     */
    public RemoveTargets(...targets:Target[])
    {
        targets.forEach(target =>
        {
            if(this.HasSameTarget(target))
                this.targetAry.splice(this.targetAry.indexOf(target), 1);
            else
                console.warn("[ScrollTargetEvent RemoveTarget] 目標不存在: " + target.$anchor.get(0).outerHTML);

        });
    }

    /**
     * 檢查目標是否存在
     * @private
     * @param {Target} target 目標
     * @returns {boolean}
     * @memberof ScrollTargetEvent
     */
    private HasSameTarget(target:Target):boolean
    {
        return this.targetAry.some(_target => {
            return _target.$anchor.is(target.$anchor);
        })
    }

    /**
     * 檢測觸發事件
     * @private
     * @memberof ScrollTargetEvent
     */
    private DetectTriggerEvt()
    {
        this.targetAry.forEach(target =>
        {
            const nowTop:number = $(document).scrollTop();
            const targetTop:number = target.$anchor.offset().top;       //觸發點Y座標
            const targetHeight:number = target.$anchor.innerHeight();   //觸發物件高度
            
            if(!target.triggered)
            {
                //到達觸發點
                if(nowTop >= (targetTop + target.triggerOffsetY) && nowTop <= (targetTop + targetHeight + target.triggerOffsetY))
                {
                    if(target.triggerEvt != null) target.triggerEvt();
                    target.triggered = true;
                }
            }
            else if(target.triggered && target.reset)
            {
                //重置判斷
                if(nowTop >= (targetTop + targetHeight))
                {
                    target.triggered = false;
                    if(target.initEvt != null) target.initEvt();
                }
                else if((nowTop + $(window).height()) <= targetTop)
                {
                    target.triggered = false;
                    if(target.initEvt != null) target.initEvt();
                }
            }

        });
    }
}

export class Target
{
    public $anchor:JQuery;
    public initEvt:Function;
    public triggerEvt:Function;

    public triggerOffsetY:number;   //觸發偏移高度
    public reset:boolean;           //重置旗標
    public triggered:boolean;       //觸發旗標

    /**
     * 建構式
     * @param {JQuery} $anchor 觸發點
     * @param {Function} [initEvt=null] 初始化事件
     * @param {Function} [triggerEvt=null] 觸發事件
     * @param {number} [triggerOffsetY=null] 觸發偏移高度， (負數提前，正數延後)
     * @param {boolean} [repeat=false] 是否啟動重置事件
     * @memberof Target
     */
    constructor($anchor:JQuery, initEvt:Function = null, triggerEvt:Function = null, triggerOffsetY:number = 0, repeat:boolean = false)
    {
        this.$anchor = $anchor;
        this.initEvt = initEvt;
        this.triggerEvt = triggerEvt;
        this.triggerOffsetY = triggerOffsetY;
        this.reset = repeat;

        this.triggered = false;
    }
}
