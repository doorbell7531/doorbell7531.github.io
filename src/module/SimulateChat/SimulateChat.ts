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
     * @param {string} scriptName 腳本名稱
     * @param {Function} [onCompleteHandler=null] 腳本完成事件
     * @memberof SimulateChat
     */
    constructor($parent:JQuery, scriptName:string, onCompleteHandler:Function = null)
    {        
        this.$parent = $parent;
        this._config = new SimulateChatConfig();
        this.LoadScript(this._config.PATH_SCRIPT + scriptName, this.Init.bind(this));
        this.onCompleteHandler = onCompleteHandler;
    }

    //#region 開放方法
    // public Start(scriptName:string)
    // {
    //     this.LoadScript(this.config.PATH_SCRIPT + scriptName, this.Init.bind(this));
    // }
    //#endregion

    /**
     * 載入腳本
     * @private
     * @param {string} xmlPath xml路徑
     * @param {Function} [callback] 載入完成事件
     * @memberof SimulateChat
     */
    private LoadScript(xmlPath:string, callback?:Function)
    {
        // $.ajax({
        //     url:xmlPath,
        //     type:"GET",
        //     dataType:"xml",
        //     success:(xml:XMLDocument, status:string, jqXHR:JQueryXHR) =>
        //     {
        //         if(jqXHR.getResponseHeader('content-type').indexOf('xml') == -1)
        //             throw new TypeError('[SimulateChat LoadScript] 腳本必須為XML檔: ' + xmlPath);
                
        //         this.xml = xml;
        //         if(callback != undefined) callback();
        //     }
        // });

        $.when(
            $.ajax({
                url:xmlPath,
                type:"GET",
                dataType:"xml",
                success:(xml:XMLDocument, status:string, jqXHR:JQueryXHR) =>
                {
                    if(jqXHR.getResponseHeader('content-type').indexOf('xml') == -1)
                        throw new TypeError('[SimulateChat LoadScript] 腳本必須為XML檔: ' + xmlPath);
                    
                    this.xml = xml;
                }
            })
            // $.ajax({
            //     url:this.config.PATH_IMG + 'avatar/',
            //     success:(data) => {
            //         $(data).find('a:contains(.jpg)').each(function(){
            //             (new Image()).src = this;
            //         });
            //     }
            // }),
            // $.ajax({
            //     url:this.config.PATH_IMG + 'sticker/',
            //     success:(data) => {
            //         $(data).find('a:contains(.gif)').each(function(){
            //             (new Image()).src = this;
            //         });
            //     }
            // })
        ).done(()=>
        {
            if(callback != undefined) callback();
        });

        // console.log(this.config.PATH_IMG);
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