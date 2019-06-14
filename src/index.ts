import SimulateChat from "./module/SimulateChat/SimulateChat";

$(function()
{
    const $wrap:JQuery = $('#main');

    const type:string = GetUrlParameter('type');
    const scriptName:string = 'script_' + type + '_' + GetUrlParameter('script') + '.xml';

    const simulateChat:SimulateChat = new SimulateChat($wrap);

    const LOCAL_TEST:boolean = true;   //本機測試

    //加入樣式
    switch(type)
    {
        case 'RFA': $wrap.addClass('RFA'); break;
        case 'unknow': $wrap.addClass('unknow'); break;
    }

    //調整路徑
    const dir:string = (LOCAL_TEST) ? './dist/' : '18/dist/';
    simulateChat.config.PATH_SCRIPT = dir + 'scripts/';
    simulateChat.config.PATH_IMG = dir + 'images/';

    // simulateChat.config.delay = 1000;
    //腳本開始
    simulateChat.Start(scriptName, ()=>{
        // console.log('腳本結束');
    });
    
    /**
     * 取得網址參數
     * @private
     * @param {string} sParam 參數名稱
     * @returns {string}
     * @memberof SimulateChat
     */
    function GetUrlParameter(sParam:string):string
    {
        const sPageURL:string = window.location.search.substring(1);
        const sURLVariables:string[] = sPageURL.split('&');
        let sParameterNames:string[] = [];

        for (let i = 0; i < sURLVariables.length; i++)
        {
            sParameterNames = sURLVariables[i].split('=');
    
            if (sParameterNames[0] === sParam) {
                return sParameterNames[1] === undefined ? null : decodeURIComponent(sParameterNames[1]);
            }
        }
    };
})
