/** ***************************************************************************
 * @summary 模擬聊天
 * @author Doorbell
* ***************************************************************************/
import { SimulateChatView } from "./SimulateChatView";
import { SC_Command } from "./SimulateChatEnum";
import { SimulateChatConfig } from "./SimulateChatConfig";

export default class SimulateChat
{
    private xml:XMLDocument;    //XML腳本

    private commandAry:XMLDocument[];       //指令陣列
    private $inserts:JQuery<XMLDocument>;   //插入指令集合

    private $parent:JQuery;
    private view:SimulateChatView
    private timer:number;
    private nowId:number;   //當前指令索引

    private _config:SimulateChatConfig;

    private onCompleteHandler:Function; //腳本完成事件

    /**
     * 建構式
     * @param {JQuery} $parent 父容器
     * @memberof SimulateChat
     */
    constructor($parent:JQuery)
    {        
        this.$parent = $parent;
        this._config = new SimulateChatConfig();
        // this.LoadAssets(xmlPath, this.Init.bind(this));
        // this.onCompleteHandler = onCompleteHandler;
    }

    //#region 開放方法
    /**
     * 開始腳本演出
     * @param {string} scriptName 腳本名稱
     * @param {Function} [onCompleteHandler=null] 腳本完成事件
     * @memberof SimulateChat
     */
    public Start(scriptName:string, onCompleteHandler:Function = null)
    {
        this.LoadAssets(scriptName, this.Init.bind(this));
        this.onCompleteHandler = onCompleteHandler;
    }

    //#endregion
    /**
     * 載入資源
     * @private
     * @param {string} scriptName 腳本名稱
     * @param {Function} [callback] 載入完成事件
     * @memberof SimulateChat
     */
    private LoadAssets(scriptName:string, callback?:Function)
    {
        const scriptPath:string = this.config.PATH_SCRIPT + scriptName;
        // const avatarPath:string = this.config.PATH_IMG + 'avatar/';
        // const stickerPath:string = this.config.PATH_IMG + 'sticker/';

        const $deferred_script:JQueryDeferred<any> = $.Deferred();
        const $deferred_imgs:JQueryDeferred<any> = $.Deferred();

        //載入腳本
        $.ajax({url:scriptPath, dataType:'xml'}).done((xml)=>
        {
            try{
                $.parseXML(xml);
                this.xml = xml;
                $deferred_script.resolve();
            }catch(err){
                throw new TypeError('[' + this.constructor.name + ' LoadScript] 無效的XML檔: ' + scriptName);
            }
        });

        //載入圖片-server API
        $.ajax({url:'?getimages', dataType:'json'}).done((jsonData)=>
        {
            const srcAry:string[] = [];
            for(let i in jsonData)
            {
                for(let j in jsonData[i]){
                    srcAry.push(jsonData[i][j]);
                }
            }
            this.PreloadImages(srcAry, () =>
            {
                //建立img實體並隱藏
                const $preload = $('<div />').appendTo($('body')).hide();
                for(let i in srcAry){
                    $('<img>', {src:srcAry[i]}).appendTo($preload);
                }

                $deferred_imgs.resolve();
            });
        });

        $.when(
            $deferred_script.promise(),
            // $deferred_imgs.promise(),
        ).done(()=>
        {
            if(callback != undefined) callback();
        });
    }

    /**
     * 預載圖片
     * @private
     * @param {string[]} srcAry 圖片資源陣列
     * @param {Function} [onComplete] 預載完成處理器
     * @memberof SimulateChat
     */
    private PreloadImages(srcAry:string[], onComplete?:Function):void
    {
        let count:number = 0;
        srcAry.forEach((src, index)=>
        {
            const img:HTMLImageElement = new Image();
            img.onload = () => 
            {
                count++;

                if(count == srcAry.length && onComplete != null)
                    onComplete();
            };
            img.src = src;
        });
    }

    /**
     * 初始化
     * @private
     * @memberof SimulateChat
     */
    private Init():void
    {
        const $entire = $(this.xml).find('simulateChatScript');

        this.commandAry = $entire.children().not(SC_Command[SC_Command.insert]).toArray();
        this.$inserts = $entire.children(SC_Command[SC_Command.insert]);

        this.view = new SimulateChatView(this.config, this.$parent);

        this.nowId = 0;
        this.Next();
    }

    /**
     * 執行下一段指令
     * @private
     * @memberof SimulateChat
     */
    private Next():void
    {
        this.timer = setTimeout(()=>{

            if(this.nowId < this.commandAry.length)
            {
                this.AnalyzeCommand($(this.commandAry[this.nowId]));
                this.nowId++;
            }
            else
            {
                //腳本結束
                clearTimeout(this.timer);
                if(this.onCompleteHandler != null) this.onCompleteHandler();
            }

        }, this.config.delay);
    }

    /**
     * 分析指令
     * @private
     * @param {JQuery<XMLDocument>} $cmd
     * @memberof SimulateChat
     */
    private AnalyzeCommand($cmd:JQuery<XMLDocument>)
    {
        switch ($cmd.prop('tagName'))
        {
            case SC_Command[SC_Command.notify]:
                this.view.AddNotify($cmd.attr('msg'));
                this.Next();
            break;

            case SC_Command[SC_Command.add]:
                this.view.AddMember(parseInt($cmd.attr('charID')));
                this.Next();
            break;

            case SC_Command[SC_Command.remove]:
                this.view.RemoveMember(parseInt($cmd.attr('charID')));
                this.Next();
            break;

            case SC_Command[SC_Command.talk]:
                this.view.AddMsg($cmd.html(), parseInt($cmd.attr('charID')));
                this.Next();
            break;
            
            case SC_Command[SC_Command.reply]:

                clearTimeout(this.timer);

                const $options:JQuery<XMLDocument> = $cmd.children('option');

                this.view.AddReplyEvent($options, (index:number)=>
                {
                    const playerMsg:string = $options.eq(index).html();
                    const insertId:string = $options.eq(index).attr('insert');  //選項分支id

                    this.view.AddMsg(playerMsg);

                    //取得對應分支
                    const $temp:JQuery<XMLDocument> = this.$inserts.filter(function(){
                        return $(this).attr('id') == insertId;
                    });

                    if($temp.length != 0)
                    {
                        //加入分支對話
                        const instance:SimulateChat = this;
                        $temp.children(SC_Command[SC_Command.talk]).each(function(index){
                            instance.commandAry.splice(instance.nowId + index, 0, $(this)[0]);
                        });

                        this.Next();
                    }
                    else
                    {
                        throw new Error('[SimulateChat AnalyzeCommand] 找不到分支:' + insertId);
                    }
                });

            break;

            default:
                throw new Error('[SimulateChat AnalyzeCommand] 不存在的指令: ' + $cmd.prop('tagName'));
        }
    }

    //#region getter/setter
    public get config():SimulateChatConfig{
        return this._config;
    }
    //#endregion
}