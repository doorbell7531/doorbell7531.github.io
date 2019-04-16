import { SimulateChatConfig } from "./SimulateChatConfig";

/** ***************************************************************************
 * @summary 模擬聊天-顯示
 * @author Doorbell
* ***************************************************************************/

export class SimulateChatView
{
    private config:SimulateChatConfig;

    private $container:JQuery;      //外層容器
    private $topSection:JQuery;     //上方區域
    private $top_members:JQuery;        //上方區域-成員顯示

    private $msgSection:JQuery;    //訊息區域
    private $msg_list:JQuery;       //訊息區域-清單

    private $btmSection:JQuery;     //底部區域

    private $replyBtn:JQuery;       //回應按鈕

    private $replyBox:JQuery;      //回應視窗

    private members:Array<number>;  //成員ID陣列
    
    constructor(config:SimulateChatConfig, $parent:JQuery)
    {
        this.config = config;

        this.$container = $('<div />', {class:'simulateChat'});

        this.$topSection = $('<div />', {class:'simulateChat-topSection'});
        this.$top_members = $('<span />', {class:'simulateChat-top-members'}).appendTo(this.$topSection);

        this.$msgSection = $('<div />', {class:'simulateChat-msgSection'});
        this.$msg_list = $('<ul />').appendTo(this.$msgSection);

        this.$btmSection = $('<div />', {class:'simulateChat-btmSection'});
        this.$replyBtn = $('<div />', {class:'simulateChat-replyBtn disable'}).appendTo(this.$btmSection);

        this.$replyBox = $('<div />', {class:'simulateChat-replyBox'});

        this.$container.append(this.$topSection);
        this.$container.append(this.$msgSection);
        this.$container.append(this.$btmSection);

        $parent.append(this.$container);

        this.members = [];
    }

    /**
     * 加入系統通知
     * @param {string} msg 訊息內容
     * @memberof SimulateChatView
     */
    public AddNotify(msg:string):void
    {
        const html:string = '<li class="notify"><span>' + msg + '</span></li>';
        this.$msg_list.append(html);
        this.ScrollListToLast();
    }

    /**
     * 加入聊天成員
     * @param {number} charID 成員ID
     * @memberof SimulateChatView
     */
    public AddMember(charID:number):void
    {
        if(this.members.indexOf(charID) == -1)
        {
            this.members.push(charID);

            let names:string[] = this.members.map(id => {
                return this.GetNameById(id);
            });
            this.$top_members.html(names.join(','));
            this.AddNotify(this.GetNameById(charID) + '已進入聊天室');
        }
        else
            console.warn('[' + this.constructor.name + 'AddMember] charID:' + charID + ' 已經在對話成員中');
    }

    /**
     * 移除聊天成員
     * @param {number} charID 成員ID
     * @memberof SimulateChatView
     */
    public RemoveMember(charID:number):void
    {
        if(this.members.indexOf(charID) != -1)
        {
            this.members.splice(this.members.indexOf(charID), 1);

            let names:string[] = this.members.map(id => {
                return this.GetNameById(id);
            });
            this.$top_members.html(names.join(','));
            this.AddNotify(this.GetNameById(charID) + '已離開聊天室');
        }
        else
            console.warn('[' + this.constructor.name + 'RemoveMember] charID:' + charID + ' 不在對話成員中');
    }

    /**
     * 加入玩家訊息
     * @param {string} msg 訊息內容
     * @memberof SimulateChatView
     */
    public AddMsg(msg:string):void;
    /**
     * 加入角色訊息
     * @param {string} msg 訊息內容
     * @param {string} charID 角色ID
     * @memberof SimulateChatView
     */
    public AddMsg(msg:string, charID:number):void;
    public AddMsg(msg:string, charID?:number):void
    {
        let html = '';
        msg = this.ConvertSticker(msg);

        if(Number.isNaN(charID) || charID == undefined)
        {
            html =
            '<li class="self">'+
                '<dl>' + 
                    '<dd>' + msg + '</dd>' +
                '</dl>' + 
            '</li>';
        }
        else
        {
            html = 
            '<li>'+
                '<img class="avatar" src="' + this.config.PATH_IMG + 'avatar/' + charID + '.jpg"></div>' + 
                '<dl>' + 
                    '<dt>' + this.GetNameById(charID) + '</dt>' +
                    '<dd>' + msg + '</dd>' +
                '</dl>' + 
            '</li>';
        }
        
        //移除貼圖背景
        let $msg:JQuery = $(html);
        $msg.find('img.sticker').parent().addClass('sticker');

        this.$msg_list.append($msg);
        this.ScrollListToLast();
    }

    /**
     * 加入回應事件
     * @param {JQuery<XMLDocument>} $options 選項資料
     * @param {Function} OnClickOption 點擊選項處理器
     * @memberof SimulateChatView
     */
    public AddReplyEvent($options:JQuery<XMLDocument>, OnClickOption:Function):void
    {
        this.$replyBtn.off().removeClass('disable');
        this.$replyBtn.click(()=>
        {
            this.$replyBtn.addClass('disable');
            this.CreateReplyOptions($options, OnClickOption);
        });
    }

    /**
     * 建立回應選項
     * @param {JQuery<XMLDocument>} $options 選項資料
     * @param {Function} OnClickOption 點擊選項處理器
     * @memberof SimulateChatView
     */
    private CreateReplyOptions($options:JQuery<XMLDocument>, OnClickOption:Function):void
    {
        this.$replyBox.append('<ul />');
        this.$container.append(this.$replyBox);    //加入回應視窗
        
        //加入選項
        let $items:JQuery;
        $options.each((index) =>
        {
           this.$replyBox.children('ul').append($('<li />', {html:$options.eq(index).html()}));
        });
        $items = this.$replyBox.find('li');

        //點擊回應容器
        this.$replyBox.click(()=>
        {
            this.$replyBtn.removeClass('disable');
            this.RemoveReply();
        });

        //點擊選項
        $items.one('click', (e)=>
        {
            e.stopPropagation();
            OnClickOption($(e.currentTarget).index());
            this.RemoveReply();
        });
    }

    /**
     * 移除回應視窗
     * @private
     * @memberof SimulateChatView
     */
    private RemoveReply()
    {
        this.$replyBox.find('*').off();
        this.$replyBox.empty().off().remove();
    }

    /**
     * 由ID取得角色名稱
     * @private
     * @param {number} charID 角色ID
     * @returns {string} 角色名稱
     * @memberof SimulateChatView
     */
    private GetNameById(charID:number):string
    {
        if(this.config.character.has(charID))
            return this.config.character.get(charID);
        else
            throw new Error('[' + this.constructor.name + ' GetNameById] 嘗試取得未設定的角色 charID:' + charID );
    }

    /**
     * 貼圖轉換
     * @private
     * @param {string} msg 訊息內容
     * @returns
     * @memberof SimulateChatView
     */
    private ConvertSticker(msg:string):string
    {
        const startIndex:number = msg.indexOf('#sticker');

        if(startIndex != -1)
        {
            const id = msg.substring(startIndex + '#sticker'.length, msg.indexOf(';'));
            return '<img class="sticker" src="' + this.config.PATH_IMG  + 'sticker/' + id + '.gif">'
        }
        else
        {
            return msg;
        }
    }

    /**
     * 捲動置底
     * @private
     * @memberof SimulateChatView
     */
    private ScrollListToLast():void
    {
        this.$msg_list.scrollTop(this.$msg_list[0].scrollHeight);
    }
}