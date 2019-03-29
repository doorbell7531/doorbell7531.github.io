/** ************************************************ *
 * Summary:文字驗證器
 * Author:Doorbell
 * ************************************************ */
export default class TextVerify
{
    /**
     * 只限中文
     * @param {String}str 文字內容
     */
    public static ChineseOnly(str:string) : boolean{
        return str.match(/^[\u4e00-\u9fa5]{0,}$/) ? true : false;
    }

    /**
     * 只限數字
     * @param {String}str 文字內容
     */
    public static NumberOnly(str:string) : boolean{
        return str.match(/^[0-9]*$/) ? true : false;
    }

    /**
     * 禁止特殊符號(只限中文、英文、數字)
     * @param {String}str 文字內容
     */
    public static ForbidSymbol(str:string) : boolean{
        return str.match(/^[\u4E00-\u9FA5A-Za-z0-9]+$/) ? true : false;
    }

    /**
     * 禁止無內容
     * @param {String}str 文字內容
     */
    public static ForbidEmpty(str:string) : boolean{
        return (str != "") ? true : false;
    }

    /**
     * 只限n位的數字
     * @param {String}str 文字內容
     * @param n 位數
     */
    public static LimitNumberChar(str:string, n:number) : boolean{
        var reg = "^\\d{n}$";
        reg = reg.replace("n", n.toString());
        return str.match(new RegExp(reg)) ? true : false;
    }

    /**
     * 只限m-n位的數字
     * @param {String}str 文字內容
     * @param min 最小位數
     * @param max 最大位數
     */
    public static LimitRangeNumberChar(str:string, min:number, max:number) : boolean{
        var reg = "^\\d{m,n}$";
        reg = reg.replace("m,n", min + "," + max);
        return str.match(new RegExp(reg)) ? true : false;
    }

    /**
     * 只限電子信箱
     * @param {String}str 文字內容
     */
    public static EmailOnly(str:string) : boolean{
        return str.match(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/) ? true : false;
    }

    /**
     * 消除所有空格
     * @param {String}str 文字內容
     */
    static RemoveAllSpace(str:string) : string{
        return str.replace(/[ ]/g, "");
    }

}