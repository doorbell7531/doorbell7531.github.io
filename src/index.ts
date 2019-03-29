import "../node_modules/@fancyapps/fancybox";
import "../node_modules/jquery.easing";
import "../src/plugins/jquery-sakura.js";

import { TweenMax, Back, Elastic, Power4} from "gsap/TweenMax";
import { ScrollTargetEvent, Target } from "./module/scrollTargetEvent";
import TextVerify from "./module/textVerify";
import Jigsaw from "./module/jigsaw";

const LOCAL_TEST:boolean = true;        //本地測試
const SHOW_CONSOLE_LOG:boolean = false;  //輸出log

$(function ()
{
    //#region DOM參照
    const $nav_notice: JQuery = $('nav li.notice');
    const $nav: JQuery = $('nav li').not($nav_notice);
    const $nav_speaker:JQuery = $('nav .speaker');

    const $header:JQuery = $('header');
    const $header_playVideo:JQuery = $header.find('.playVideo');
    const $header_video:JQuery = $header.find('video');
    const $header_feature:JQuery = $header.find('ul.feature li');
    const $header_login:JQuery = $header.find('a.login');

    const $login:JQuery = $('section#login');
    const $login_num:JQuery = $login.find('p.num');
    const $login_memberLogin:JQuery = $login.find('a.memberLogin');
    const $login_status:JQuery = $login.find('p.status');
    const $login_device:JQuery = $login.find('input[name="device"]');
    const $login_area:JQuery = $login.find('select[name="area"]');
    const $login_phone:JQuery = $login.find('input[name="phone"]');
    const $login_agree:JQuery = $login.find('input[name="agree"]');
    const $login_submit:JQuery = $login.find('button[type="submit"]');
    const $login_leftChar:JQuery = $login.find('.leftChar');
    const $login_rightChar:JQuery = $login.find('.rightChar');

    const $achieved:JQuery = $('section#achieved');
    const $achieved_items:JQuery = $achieved.find('ul li');
    const $achieved_60k:JQuery = $achieved_items.eq(2);

    const $plus:JQuery = $('section#plus');
    const $plus_jigsaw:JQuery = $plus.find('.jigsaw');
    const $plus_statusImg:JQuery = $plus_jigsaw.children('img.status');
    const $plus_thumnailImg:JQuery = $plus_jigsaw.children('img.thumbnail');
    const $plus_leftChar:JQuery = $plus.find('.leftChar');
    const $plus_rightChar:JQuery = $plus.find('.rightChar');

    const $chara:JQuery = $('section#character');
    const $chara_bg:JQuery = $chara.find('ul.charBg li');
    const $chara_full:JQuery = $chara.find('ul.charFull li');
    const $char_name:JQuery = $chara.find('ul.charName li');
    const $char_sound:JQuery = $chara.find('ul.charSound li');
    const $char_intro:JQuery = $chara.find('ul.charIntro li');
    const $char_ctrl:JQuery = $chara.find('ul.ctrl li');
    const $char_audio:JQuery = $chara.find('audio');

    const $notify:JQuery = $('#notify');
    const $toTop: JQuery = $('#toTop');
    const $fbShare:JQuery = $('.fbShare');
    //#endregion

    const dir:string = (LOCAL_TEST) ? './dist/' : '16/dist/';
    const path_img:string = dir + 'images/';
    const path_sound:string = dir + 'audio/sound/';

    const targetEvt:ScrollTargetEvent = new ScrollTargetEvent();

    const scrollDuration: number = 400; //捲軸速度

    let dto:DTO = new DTO();
    let scrolling: boolean = false;

    if(SHOW_CONSOLE_LOG)
    {
        console.log('IMG PATH => ' + path_img);
        console.log('SOUND PATH => ' + path_sound);
    }
    
    //FB SDK 初始化
    $.getScript('https://connect.facebook.net/zh_TW/sdk.js', function()
    {
        FB.init({
            appId:'409476035897217',    //test
            // appId:'412485986209615',
            xfbml:true,
            version:'v3.2'
        });

        //test
        console.log('!!!!!!!!!!!!!!!');
        
        FB.ui({
            method: 'share',
            href: window.location.href
        });
        //end of test

        //點擊開啟FB分享
        $fbShare.click(()=>
        {
            FB.ui({
                method: 'share',
                href: window.location.href
            });
        });
    });
    

    if(LOCAL_TEST)
    {
        dto.uid = "12057310";
        dto.count = "20000";
        dto.login = false;
        // dto.complete = true;

        Init_login();
        Init_plus();
    }
    else
    {
        SendHttpRequest('user', () =>
        {
            Init_login();
            Init_plus();
        });
    }

    Init_global();
    Init_nav();
    Init_header();
    Init_achieved();
    Init_character();

    ScrollTargetEvt();
    FallingSakura();
    // MouseWheelEvt();
    CheckTopBtm();

    /**
     * 發送HTTP請求
     * @param {string} type API Method
     * @param {Function} [callback=null] 成功後值行
     */
    function SendHttpRequest(type:string, callback:Function = null)
    {
        dto.type = type;
        const jsonData:JSON = JSON.parse(JSON.stringify(dto));

        if(SHOW_CONSOLE_LOG)
            console.log('SEND DATA -> ' + JSON.stringify(jsonData));
        
        $.ajax({
            url: '?login',
            type: 'POST',
            data:jsonData,
            dataType:'json',
            success: (returnData) =>
            {
                if(SHOW_CONSOLE_LOG)
                    console.log('SUCCESS RETURN -> ', returnData);

                //依類型寫入資料
                switch(type)
                {
                    //用戶檢查
                    case 'user':
                        dto.uid = returnData.uid;
                        dto.count = returnData.count;
                        dto.login = returnData.login;
                        dto.complete = returnData.complete;
                    break;

                    //事前登錄
                    case 'login':
                        if(returnData.msg == "already" || returnData.msg == "success")
                            dto.login = true;
                    break;

                    //拼圖完成
                    case 'complete':
                        if(returnData.msg == "already" || returnData.msg == "success")
                            dto.complete = true;
                    break;
                }

                if(callback != null) callback();
            },
            error :(error) => {

                if(SHOW_CONSOLE_LOG)
                    console.log('FAIL -> ', error);
            }
        });
    }

    function Init_global()
    {
        //點擊回置頂
        $toTop.click(() => {
            ScrollTo(0);
        });

        //卷軸事件
        $(window).scroll(() => {
            CheckTopBtm();
        });
    }

    function Init_nav()
    {
        //開啟注意事項
        $nav_notice.click(() => {
            $.fancybox.open($('#notice'));
        });

        //點擊主選單
        $nav.click(function () {
            const $anchor:JQuery = $('#' + $(this).attr('data-anchor'));
            ScrollTo($anchor.offset().top);
            return false;
        });

        //點擊影片音樂開關
        $nav_speaker.click(function()
        {
            const video:HTMLVideoElement = $header_video[0] as HTMLVideoElement;
            video.muted = !video.muted;
            
            if(video.muted)
                $(this).removeClass('on');
            else
                $(this).addClass('on');
        });
    }

    function Init_header()
    {
        const video:HTMLVideoElement = $header_video[0] as HTMLVideoElement;
        if(IsMobile())
            video.oncanplay = () => video.pause(); //手機板暫停播放
        else
            video.oncanplay = () => video.play();
            
        //點擊播放影片
        $header_playVideo.click(()=>
        {
            $.fancybox.open($header_video);
            // $header_video.prop('controls', true);
            video.controls = true;
            video.muted = false;
            video.play();
        }); 

        //滑入特色事件
        $header_feature.hover(function()
        {
            if(!TweenMax.isTweening($(this)))
                TweenMax.to($(this), 0.3, {y:"-15%", yoyo:true, ease:Back.easeIn, repeat:1});

        }, ()=>{});

        //點擊事前登錄
        $header_login.click(()=>{
            ScrollTo($login.offset().top);
        });
    }

    function Init_login()
    {
        if(dto.uid != null)
        {
            let html:string = '您已登入會員';

            html += (dto.login) ? ' (已完成事前預約)' : ' (尚未完成事前預約)';
            html += '<br>ID:' + dto.uid;

            $login_status.html(html);
            $login_status.show();
            $login_memberLogin.hide();
        }
        
        if(dto.count == null) dto.count = "0";

        $login_num.html(dto.count);

        //尚未登入平台 || 尚未事前登錄
        if(dto.uid == null || dto.login)
        {
            $login.find('*').prop('disabled', true);
        }
        else
        {
            CheckForm();

            //裝置
            $login_device.change(function(){
                dto.choice = $(this).val().toString();
                CheckForm();
            });
    
            //區碼
            $login_area.change(() => {
                SetPhone();
            });
    
            //號碼
            $login_phone.keyup(() => {
                SetPhone()
            });
    
            //同意
            $login_agree.change(()=>{
                CheckForm();
            });
    
            //送出
            $login_submit.click(() =>
            {
                if(CheckForm())
                {
                    SendHttpRequest('login', ()=>{
                        Init_login();
                        Init_plus();
                    });
                }
    
                return false;
            });
        }

        //設定號碼
        function SetPhone(){ 
            dto.phone = ($login_area.val() != "null" && TextVerify.ForbidEmpty($login_phone.val().toString())) ?  ($login_area.val().toString() + $login_phone.val().toString()) : null;
            CheckForm();
        };
        
    }

    function Init_achieved()
    {
        if(IsMobile())
        {
            const $img:JQuery =  $achieved_60k.children('img').filter(function(){return $(this).attr('class') != 'get';});
            $img.attr('src', path_img + 'achieved/60000_m.png');
        }
    }

    function Init_plus()
    {
        if(dto.login && !dto.complete)  //已完成事前登錄，未完成拼圖
        {
            $plus_statusImg.hide();
            const srcAry:string[] = new Array<string>(
                path_img + 'atlas/atlas_1.jpg',
                path_img + 'atlas/atlas_2.jpg'
            );
            const src:string = srcAry[Math.round(Math.random()) * (srcAry.length - 1)];
            $plus_thumnailImg.attr("src", src);

            new Jigsaw($plus_jigsaw, src, ()=>
            {
                //拼圖完成
                dto.complete = true;
                SendHttpRequest('complete', () => {
                    $.fancybox.open($('#complete'));
                });

                $plus_jigsaw.click(()=>{
                    $.fancybox.open($('#complete'));
                });
            });
        }
        else if(dto.login && dto.complete)  //已完成事前登錄，已完成拼圖
        { 
            $plus_statusImg.attr('src', path_img + 'lock_comp.jpg');

            $plus_jigsaw.click(()=>{
                $.fancybox.open($('#complete'));
            });
        }
        else if(!dto.login){    //未完成事前登錄
            $plus_statusImg.attr('src', path_img + 'lock_login.jpg');
        }
    }

    function Init_character()
    {
        let nowId:number = 0;

        if(IsMobile())
        {
            //更換背景圖
            $chara_bg.each(function(index)
            {
                $(this).children('img').attr('src', path_img + 'character/bg/bg_' + (index + 1) + '_m.png');
            });

            //更換名稱
            $char_name.each(function(index)
            {
                $(this).children('img').attr('src', path_img + 'character/name/name_' + (index + 1) + '_m.png');
            });
        }

        //點擊控制
        $char_ctrl.click(function()
        {
            if(nowId != $(this).index())
            {
                TweenMax.to($chara_bg.eq(nowId), 0.6, {alpha:0});
                TweenMax.to($char_name.eq(nowId), 0.6, {alpha:0, y:"-50%", ease:Power4.easeOut});
                TweenMax.to($char_intro.eq(nowId), 0.6, {alpha:0, y:"20%", ease:Power4.easeOut});
                TweenMax.to($chara_full.eq(nowId), 0.6, {alpha:0, x:"20%", ease:Back.easeOut});

                nowId = $(this).index();

                TweenMax.to($chara_bg.eq(nowId), 0.6, {alpha:1});
                TweenMax.fromTo($char_name.eq(nowId), 0.6, {alpha:0, y:"50%"}, {alpha:1, y:"0%", ease:Power4.easeOut});
                TweenMax.fromTo($char_intro.eq(nowId), 0.6, {alpha:0, y:"-20%"}, {alpha:1, y:"0%", ease:Power4.easeOut});
                TweenMax.fromTo($chara_full.eq(nowId), 0.6, {alpha:0, x:"20%"}, {alpha:1, x:"0%", ease:Back.easeOut});

                TweenMax.fromTo($char_sound, 0.6, {alpha:0, x:"20%"}, {alpha:1, x:"0%", ease:Back.easeOut});
            }
        });

        //點擊配音
        $char_sound.click(function()
        {
            let audio:HTMLAudioElement = $char_audio[0] as HTMLAudioElement;
            audio.src = path_sound + 'char_' + (nowId + 1) + '/' + ($(this).index() + 1) + '.mp3';
            audio.play();
        });
    }

    /**
     * 檢查表單
     * @returns {boolean}
     */
    function CheckForm():boolean
    {
        let isDone:boolean = (dto.choice != null && dto.phone != null && $login_agree.is(':checked')) ? true : false;
        $login_submit.prop('disabled', !isDone);

        return isDone;
    }

    /**
     * 卷軸目標觸發事件
     */
    function ScrollTargetEvt():void
    {
        //header
        const header:Target = new Target($header, null, () =>
        {
            $header_feature.each(function(index)
            {
                if(!TweenMax.isTweening($(this)))
                    TweenMax.from($(this), 1, {y:"100%", alpha:0, ease:Back.easeOut, delay:index * 0.2});
            });

            if(!TweenMax.isTweening($header_login))
                TweenMax.from($header_login, 1, {y:"-100%", alpha:0, ease:Back.easeOut, delay:0.8});

        }, 0, true);

        //login
        const loginOffset:number = ($(this).outerWidth() == screen.width) ? 0: $login.outerHeight(true); //滿版判斷
        const login:Target = new Target($login,
        ()=>
        {
            TweenMax.to($login_leftChar, 1, {x:"-30%", alpha:0, ease:Power4.easeOut});
            TweenMax.to($login_rightChar, 1, {x:"30%", alpha:0, ease:Power4.easeOut});

        },
        () =>
        {
            TweenMax.fromTo($login_leftChar, 2, {x:"-30%", alpha:0}, {x:"0%", alpha:1, ease:Power4.easeOut});
            TweenMax.fromTo($login_rightChar, 2, {x:"30%", alpha:0}, {x:"0%", alpha:1, ease:Power4.easeOut});

        }, -loginOffset, true);

        //achieved
        const achieved:Target = new Target($achieved,
        () => {
            $achieved_items.find('img.get').hide();
        },
        () =>
        {
            const count:number = parseInt(dto.count);

            $achieved_items.each(function(index)
            {
                const achieved:number = parseInt($(this).attr('data-achieved'));
                const $img:JQuery = $(this).children('img.get');

                if(count >= achieved)
                {
                    $img.show();
                    TweenMax.fromTo($img, 0.6, {scale:10, alpha:0, rotation:-360}, {scale:1, alpha:1, rotation:0, ease:Back.easeOut, delay:index * 0.2});
                }
            });

        }, -$achieved.outerHeight(true) * 0.2, true);

        //plus
        const plus:Target = new Target($plus,
        ()=>
        {
            TweenMax.to($plus_leftChar, 0.8, {x:"30%", alpha:0});
            TweenMax.to($plus_rightChar, 0.8, {x:"-30%", alpha:0});
        },
        ()=>
        {
            TweenMax.fromTo($plus_leftChar, 0.8, {x:"30%", alpha:0}, {x:"0%", alpha:1, ease:Back.easeOut});
            TweenMax.fromTo($plus_rightChar, 0.8, {x:"-30%", alpha:0}, {x:"0%", alpha:1, ease:Back.easeOut});

        }, -$plus.outerHeight(true) * 0.2, true);

        targetEvt.AddTargets(header, login, achieved, plus);

        if(IsMobile())
            targetEvt.RemoveTargets(login);
    }

    /**
     * 掉落櫻花
     */
    function FallingSakura():void
    {
        const setting:object = {
            // blowAnimations:['blow-soft-left', 'blow-medium-left'],
            newOn:600,
            fallSpeed:1.5,
            maxSize:14,
            minSize:9
        }

        if(IsMobile())
            setting['maxSize'] = 12;

        $('#sakuraWrap').sakura('start', setting);
    }

    /**
     * 滾輪事件
     */
    function MouseWheelEvt() : void
    {
        $(window).on('mousewheel', function (e)
        {
            //滿版判斷
            if($(this).outerWidth() == screen.width)
                e.preventDefault();
            else
                return true;

            if (scrolling) return;

            const evt: any = e.originalEvent;

            const nowTop: number = $(this).scrollTop();
            const mul: number = nowTop / $(this).innerHeight();

            if (evt.wheelDelta < 0) //向下
            {
                if (MatchTop())
                    ScrollTo(nowTop + $(this).innerHeight());
                else
                    ScrollTo($(this).innerHeight() * Math.ceil(mul));
            }
            else    //向上
            {
                if (MatchTop())
                    ScrollTo(nowTop - $(this).innerHeight());
                else
                    ScrollTo($(this).innerHeight() * Math.floor(mul));
            }

            function MatchTop(): boolean {
                return (nowTop % $(window).innerHeight() == 0);
            }
        });
    }

    /**
     * 捲動視窗
     * @param {number} scrollTop 離置頂距離
     */
    function ScrollTo(scrollTop: number): void
    {
        scrolling = true;
        $('html').stop(true, false).animate({ 'scrollTop': scrollTop }, scrollDuration, 'easeOutCubic', () => {
            scrolling = false;
            CheckTopBtm();
        });
    }

    /**
     * 檢查置頂按鈕
     */
    function CheckTopBtm(): void {
        ($('html').scrollTop() == 0) ? $toTop.fadeOut() : $toTop.fadeIn();
    }


    /**
     * 行動裝置判斷
     * @param {boolean} [countIPad=false] 將iPad視作行動裝置
     * @returns {boolean}
     */
    function IsMobile(countIPad:boolean = false):boolean
    {
        let isMobile:boolean = false;

		// try{ 
		// 	document.createEvent("TouchEvent");
		// 	// console.log("Mobile Version");
		// 	return true;
		// }
        // catch(e){ return false;}

        if( navigator.userAgent.match(/Android/i) || 
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) || 
            navigator.userAgent.match(/Windows Phone/i)
        )
        {
            isMobile = true;

            if( !countIPad && (navigator.userAgent.match(/iPad/i) != null))
                isMobile = false;
        }
        else
        {
            isMobile = false;
        }
        
        return isMobile;
    }
    
    function ShowNotify(msg:string)
    {
        if(!TweenMax.isTweening($notify))
        {
            $notify.html(msg);
            TweenMax.to($notify, 0.5, {alpha:0.8, ease:Power4.easeOut, yoyo:true, repeat:1});
        }
    }
});

class DTO
{
    public type:string = null; //user:平台登入檢查 login:事前登錄 complete:拼圖完成
    public uid:string = null;
    public count:string = null;         //登錄人數
    public login:boolean = false;       //事前登錄
    public complete:boolean = false;    //拼圖完成

    //form
    public choice:string = null;   //2:ios 3:android
    public phone:string = null;
}