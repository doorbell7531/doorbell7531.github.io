import 'jquery.easing';
import { MouseWheelScreen } from "./Modules/MouseWheelScreen";

const LOCAL_TEST:boolean = true;    //本機測試
const SHOW_LOG:boolean = true;      //顯示log

//全域擴充方法
declare global{
    interface String{
        log():void;
    }
}
String.prototype.log = function(){
    if(SHOW_LOG) console.log(this);
}

$(function ()
{
    //#region DOM參照
    const $nav:JQuery = $('nav');
    const $navList:JQuery = $nav.children('ul');
    const $section_rules = $('section.rules');
    const $section_activity = $('section.activity');
    const $section_notice = $('section.notice');

    const $toTop: JQuery = $('#toTop');
    //#endregion

    const dto:DTO = new DTO();

    //點擊主選單項目
    $nav.find('li').click(function()
    {
        const $target:JQuery = $('section.'+ $(this).attr('data-section'));

        if($target.length == 1)
            MouseWheelScreen.ScrollTo($target.offset().top);
    });

    //點擊主選單
    $nav.click(function(e){
        e.stopPropagation();
        SetNavVisible(true);
    });

    //點擊視窗
    $(window).click(()=> {
        SetNavVisible(false);
    });

    MouseWheelScreen.Enable();
    MouseWheelScreen.fullScreenOnly = false;
    // MouseWheelScreen.easing = 'easeOutBack';
    MouseWheelScreen.onScrollComplete = ()=>{
        CheckTopBtm();
    };

    // SendHttpRequest('');
    CheckTopBtm();


    /**
     * 發送HttpRequest
     * @param {string} type API類型
     * @returns {JQuery.jqXHR}
     */
    function SendHttpRequest(type:string):JQuery.jqXHR
    {
        dto.type = type;
        const jsonData:JSON = JSON.parse(JSON.stringify(dto));

        return $.ajax({
            url:'',
            type:'POST',
            data:jsonData,
            dataType:'json'
        });
    }

    /**
     * 設定選單是否可見 (RWD專用)
     * @param {boolean} visible
     */
    function SetNavVisible(visible:boolean)
    {
        if($navList.css('position') == 'fixed') //RWD定位判斷
        {
            if(visible){
                $navList.show();
                $navList.css('right', 0);
            }
            else
                $navList.css('right', -$navList.width());
        }
    }

    /**
     * 檢查置頂按鈕
     */
    function CheckTopBtm(): void {
        ($('html, body').scrollTop() == 0) ? $toTop.fadeOut() : $toTop.fadeIn();
    }
});

class DTO
{
    public type:string = null;              //getUser:平台登入檢查  recommend:送出推薦人ID
    public snsId:number = null;             //平台ID
    public gameId:number = null;            //遊戲ID
    public completed:boolean = false;       //已有推薦人
    public recommendId:number = null;       //推薦人ID
    public recommendAmount:number = null;   //被推薦的次數

    public error:string = null;         //錯誤訊息 (ex:推薦人不到10級)
}