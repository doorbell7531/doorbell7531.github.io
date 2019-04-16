export class SimulateChatConfig
{
    /** 腳本路徑 */
    public PATH_SCRIPT:string = '../../dist/scripts/';

    /** 圖片路徑 */
    public PATH_IMG:string = '../../dist/images/'

    /**
     * 角色設定
     * @type {Map<number, string>} 角色ID, 角色名稱
     * @memberof SimulateChatConfig
     */
    public character:Map<number, string> = new Map<number, string>([
        [100, '707'],
        [101, '流星★'],
        [102, '姜濟希'],
        [103, '韓主旻'],
        [104, 'ZEN'],
        [105, 'Ray'],
        [106, 'V'],
        [999, 'Unknown']
    ]);

    /** 對話延遲(ms) */
    public delay:number = 1000;
}