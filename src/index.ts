const fbPromise: Promise<void> = $.getScript('https://connect.facebook.net/zh_TW/sdk.js').done(()=>{
    FB.init({
        appId: '817081745317047',   //測試用APP - Test 1
        xfbml: true,
        version: 'v3.2'
    });
});

$('a.Login_Scope').click(()=>OnResolved(()=>{
    FB.login((response:fb.StatusResponse)=>
    {
        console.log(response.status);
        
        // console.log('name = ' + response.name);
        // console.log('email = ' + response.email);
        // console.log('user_likes = ' + response.user_likes);
        // console.info('1');

    },{scope:'email,user_likes,user_friends,user_location,user_posts,user_videos'});
}));

$('a.logout').click(()=>OnResolved(()=>{
    FB.logout((response:fb.StatusResponse)=>{
        console.log(response.status);
    });
}));

function OnResolved(callback:Function){
    fbPromise.then(()=>callback());
}