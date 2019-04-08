const fbPromise: Promise<void> = $.getScript('https://connect.facebook.net/zh_TW/sdk.js').done(()=>{
    FB.init({
        appId: '409476035897217',
        xfbml: true,
        version: 'v3.2'
    });
});

$('a.login').click(()=>OnResolved(()=>{
    FB.login((response:fb.StatusResponse)=>{
        console.log(response.status);
    }, {scope:'email'});
}));

$('a.logout').click(()=>OnResolved(()=>{
    FB.logout((response:fb.StatusResponse)=>{
        console.log(response.status);
    });
}));

function OnResolved(callback:Function){
    fbPromise.then(()=>callback());
}