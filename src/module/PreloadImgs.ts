/* ***************************************************************************
 * Summary: 圖片預載
 * Author: Doorbell
 * ************************************************************************** */
export class PreloadImgs
{
    /**
     * 載入圖片
     * @static
     * @param {string[]} srcList 圖片資源陣列
     * @param {Function} [completeHandler]
     * @memberof PreloadImgs
     */
    public static async Load(srcList:string[], completeHandler?:Function)
    {
        await this.LoadImgs(srcList);

        if(completeHandler!=null) completeHandler();
    }

    private static async LoadImgs(srcList:string[]):Promise<any>
    {
        let proList:Promise<any>[] = [];

        let temp:HTMLElement = document.createElement('div');
        document.body.appendChild(temp);

        srcList.forEach((src, index) =>
        {
            let promise:Promise<any> = new Promise((resolve, reject)=>
            {
                let img:HTMLImageElement = new Image();
                img.src = src;
                img.onload = () => resolve();
                img.onerror = () => reject();
                temp.appendChild(img);
            }).catch(()=>{
                throw new Error('[' + this.name + '] 無法載入圖片：' + src);
            });

            proList.push(promise);
        });
        
        return Promise.all(proList).then(()=>
        {
            document.body.removeChild(temp);
            return Promise.resolve();
        });
    }
}