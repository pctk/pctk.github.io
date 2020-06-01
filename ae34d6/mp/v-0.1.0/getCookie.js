$(document).ready(function () {
    
    console.log("gggggggggggggggggggggg")
    const { ipcRenderer } = require('electron');
    function getCookie(name) {
        let arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
        else
        return null;
    }

    function sendCookie() {
        let cookies = {
            'dy_did': getCookie('dy_did'),
            'acf_username': getCookie('acf_username'),
            'acf_uid': getCookie('acf_uid'),
            'acf_ltkid': getCookie('acf_ltkid'),
            'acf_stk': getCookie('acf_stk')
        }
        ipcRenderer.sendToHost(cookies);
    }
    console.log(abc)

    sendCookie();

    ipcRenderer.on('wx-webview-msg', async (event, arg) => {
        sendCookie();
    });

});