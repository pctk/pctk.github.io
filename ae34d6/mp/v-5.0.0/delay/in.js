$(document).ready(function () {

    // nedb start
    // const remote = require('electron').remote;
    // const Datastore = remote.require('nedb');
    // const Datastore = require('nedb');
    const Datastore = require('nedb');

    let db = {};
    db.anchor = new Datastore({
        filename: './data/anchor.db',
        autoload: true
    });

    db.history = new Datastore({
        filename: './data/history.db',
        autoload: true
    });

    function anchorAdd(data) {
        db.anchor.insert(data, (err, ret) => {});
    }
    function anchorRemove(roomId) {
        db.anchor.remove({ roomId: roomId }, {}, (err, ret) => {});
    }
    function anchorFindAll(fuc) {
        return db.anchor.find({}, fuc);
    }
    function anchorFindOne(roomId, fuc) {
        db.anchor.findOne({ roomId: roomId }, fuc);
    }
    function historyAdd(data) {
        db.history.insert(data, (err, ret) => {});
    }

    function historyFind() {
        db.history.find({}, function (err, docs) {
        });
    }
    // wss://danmuproxy.douyu.com:8502"
    // nedb end

function sleep(ms){
    return new Promise((resolve)=>setTimeout(resolve,ms));
}

//与其他窗口交互开始
const ipc = require('electron').ipcRenderer;
ipc.on('log-message', (event, arg) => {
    showLog(arg);
});

ipc.on('result-message', (event, arg) => {
    let quizId = arg.quizId,
    leftOrRight = arg.leftOrRight;
    if ('guess' === arg.action) {
        $(`.to-guess .do-kc[data-qid="${quizId}"][data-loc="${leftOrRight}"]`).html('开猜');
        $(`.to-guess .do-kc[data-qid="${quizId}"][data-loc="${leftOrRight}"]`).attr("data-action", "auto");
    } else {
        $(`.to-rob .do-xz[data-qid="${quizId}"][data-loc="${leftOrRight}"]`).html('下注');
        $(`.to-rob .do-xz[data-qid="${quizId}"][data-loc="${leftOrRight}"]`).attr("data-action", "auto");
    }
    
});

let isRemoveDom = true;
ipc.on('main-message', (event, arg) => {
    if('page-init-info' === arg.action) {
        let content = arg.content,
        kunRoomId = +content.kunRoomId,
        anchorName = content.anchorName,
        title = content.title,
        leftTitle = content.leftTitle,
        leftOdds = +content.leftOdds,
        rightTitle = content.rightTitle,
        rightOdds = +content.rightOdds,
        quizId = +content.quizId,
        qs = +content.qs,
        wo = +content.wo,
        length = +content.length;
        if (isRemoveDom) {
            isRemoveDom = false;
            $(`.guess-record li[data-room-id="${kunRoomId}"] table`).remove();
        }
        
        let leftOddsDom = `${leftTitle}/&nbsp;<span class="left-result">${leftOdds == 0.0 ? '\u7b49\u5f85\u5f00\u731c': '\u8d54\u7387:' + leftOdds / 100}</span>`;
        let rightOddsDom = `${rightTitle}/&nbsp;<span class="right-result">${rightOdds == 0.0 ? '\u7b49\u5f85\u5f00\u731c': '\u8d54\u7387:' + rightOdds / 100}</span>`;
        let anchorNameDom = `<i class="iconfont icon icon-user"></i>${anchorName}`;
        
        if (3 === +qs && 1 === +wo) {
            leftOddsDom = `${leftTitle}/&nbsp;<span class="left-result">胜</span>`;
            rightOddsDom = `${rightTitle}/&nbsp;<span class="right-result">负</span>`;
        } else if (3 === +qs && 1 !== +wo && 0 !== +wo) {
            leftOddsDom = `${leftTitle}/&nbsp;<span class="left-result">负</span>`;
            rightOddsDom = `${rightTitle}/&nbsp;<span class="right-result">胜</span>`;
        } else if (4 === +qs) {
            leftOddsDom = `${leftTitle}/&nbsp;<span class="left-result">流局</span>`;
            rightOddsDom = `${rightTitle}/&nbsp;<span class="right-result">流局</span>`;
        } else if (2 === +qs) {
            leftOddsDom = `${leftTitle}/&nbsp;<span class="left-result">已封盘</span>`;
            rightOddsDom = `${rightTitle}/&nbsp;<span class="right-result">已封盘</span>`;
        };

        let contentDom = `<table data-qid="${quizId}" class="table table-bordered">
            <col style="width: 50%" />
            <col style="width: 50%" />
            <tbody>
                <tr>
                    <td>
                        <div class="title record-content-row" title="${title}">${title}</div>
                        <div class="xz record-content-row">赔率&nbsp;:&nbsp;<input maxlength="3" placeholder="0.1-9.9" class="guess-odds"></div>
                        <div class="xz record-content-row">鱼丸&nbsp;:&nbsp;<input class="guess-num" maxlength="9" placeholder="输入数量"></div>
                        <div class="record-content-row kc-xz-in">
                            <label class="xz"><span>秒盘:</span><input class="is-mp" type="checkbox"></label>
                            <label class="xz"><span>9.9:</span><input class="is-kc99" type="checkbox"></label>
                        </div>
                        <div class="item-left record-content-row">${leftOddsDom}</div>
                        <div data-qid="${quizId}" data-room-id="${kunRoomId}" data-title="${title}" data-loc="0" data-action="auto" class="do-xz left-do-xz">下注</div>
                    </td>
                    <td>
                        <div class="record-content-row anchor-z" title="${anchorName}">${anchorNameDom}</div>
                        <div class="xz record-content-row">赔率&nbsp;:&nbsp;<input maxlength="3" placeholder="0.1-9.9" class="guess-odds"></div>
                        <div class="xz record-content-row">鱼丸&nbsp;:&nbsp;<input class="guess-num" maxlength="9" placeholder="输入数量"></div>
                        <div class="record-content-row kc-xz-in">
                            <label class="xz">秒盘:<input class="is-mp" type="checkbox"></label>
                            <label class="xz">9.9:<input class="is-kc99" type="checkbox"></label>
                        </div>
                        <div class="item-right record-content-row">${rightOddsDom}</div>
                        <div data-qid="${quizId}" data-room-id="${kunRoomId}" data-title="${title}" data-loc="1" data-action="auto" class="do-xz right-do-xz">下注</div>
                    </td>
                </tr>
            </tbody>
        </table>`;

        let contentGuessDom = `<table data-qid="${quizId}" class="table table-bordered">
            <col style="width: 50%" />
            <col style="width: 50%" />
            <tbody>
                <tr>
                    <td>
                        <div class="title record-content-row" title="${title}">${title}</div>
                        <div class="xz record-content-row">赔率&nbsp;:&nbsp;<input maxlength="3" placeholder="0.1-9.9" class="guess-odds"></div>
                        <div class="xz record-content-row">鱼丸&nbsp;:&nbsp;<input class="guess-num" maxlength="9" placeholder="输入数量"></div>
                        <div class="item-left record-content-row">${leftOddsDom}</div>
                        <div class="record-content-row">
                            <div data-qid="${quizId}" data-room-id="${kunRoomId}" data-title="${title}" data-loc="0" data-action="auto" class="do-kc left-do-kc">开猜</div>
                        </div>
                    </td>
                    <td>
                        <div class="record-content-row anchor-z" title="${anchorName}">${anchorNameDom}</div>
                        <div class="xz record-content-row">赔率&nbsp;:&nbsp;<input maxlength="3" placeholder="0.1-9.9" class="guess-odds"></div>
                        <div class="xz record-content-row">鱼丸&nbsp;:&nbsp;<input class="guess-num" maxlength="9" placeholder="输入数量"></div>
                        <div class="item-right record-content-row">${rightOddsDom}</div>
                        <div class="record-content-row">
                            <div data-qid="${quizId}" data-room-id="${kunRoomId}" data-title="${title}" data-loc="1" data-action="auto" class="do-kc right-do-kc">开猜</div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>`;

        if ($(`.to-rob li[data-room-id="${kunRoomId}"]`).length < 1) {
            $('.to-rob').prepend(`<li class="list-group-item cf" data-room-id="${kunRoomId}"></li>`)
        }

        if ($(`.to-guess li[data-room-id="${kunRoomId}"]`).length < 1) {
            $('.to-guess').prepend(`<li class="list-group-item cf" data-room-id="${kunRoomId}"></li>`)
        }

        let abccPar = $(`.to-rob li[data-room-id="${kunRoomId}"] table`);
        if (abccPar.length > 0) {
            abccPar.each(function(n,value) {
                let tempQuizId = value.getAttribute('data-qid');
                if (tempQuizId > quizId) {
                    $(value).before(contentDom);
                    return false;
                } else if (n === abccPar.length - 1) {
                    $(value).after(contentDom);
                    return false;
                }
            });
        } else {
            $(`.to-rob li[data-room-id="${kunRoomId}"]`).prepend(contentDom);
        }

        // 开猜
        let abccParG = $(`.to-guess li[data-room-id="${kunRoomId}"] table`);
        if (abccParG.length > 0) {
            abccParG.each(function(n,value) {
                let tempDataIndex = value.getAttribute('data-qid');
                if (tempDataIndex > quizId) {
                    $(value).before(contentGuessDom);
                    return false;
                } else if (n === abccParG.length - 1) {
                    $(value).after(contentGuessDom);
                    return false;
                }
            });
        } else {
            $(`.to-guess li[data-room-id="${kunRoomId}"]`).prepend(contentGuessDom);
        }

        if (length === $(`.to-guess li[data-room-id="${kunRoomId}"] table`).length) {
            isRemoveDom = true;
        }
    } else if('page-info' === arg.action) {
        let content = arg.content,
        kunRoomId = +content.kunRoomId,
        leftOdds = +content.leftOdds,
        rightOdds = +content.rightOdds,
        quizId = +content.quizId,
        qs = +content.qs,
        wo = +content.wo;
        let leftOddsDom = leftOdds == 0.0 ? '\u7b49\u5f85\u5f00\u731c': '\u8d54\u7387:' + leftOdds / 100;
        let rightOddsDom = rightOdds == 0.0 ? '\u7b49\u5f85\u5f00\u731c': '\u8d54\u7387:' + rightOdds / 100;

        if (3 === +qs && 1 === +wo) {
            leftOddsDom = '胜';
            rightOddsDom = '负';
        } else if (3 === +qs && 1 !== +wo && 0 !== +wo) {
            leftOddsDom = '负';
            rightOddsDom = '胜';
        } else if (4 === +qs) {
            leftOddsDom = '流局';
            rightOddsDom = '流局';
        } else if (2 === +qs) {
            leftOddsDom = '已封盘';
            rightOddsDom = '已封盘';
        };

        let abcc = $(`.guess-record li[data-room-id="${kunRoomId}"] table[data-qid="${quizId}"]`);
        abcc.find('.left-result').html(leftOddsDom);
        abcc.find('.right-result').html(rightOddsDom);
        
    }
    // console.log(arg+  '--hand--' + (new Date()).getTime());
});


$(document).on('click', '.do-clear', function(){
    $('.message-history').html('');
})
$(document).on('click', '.to-rob .do-xz', function(){
    let dataAction = $(this).attr("data-action");
    let isListen = dataAction === 'cancel' ? false : true;
    let kunRoomId = $(this).attr('data-room-id'),
    quizId = $(this).attr('data-qid'),
    leftOrRight = $(this).attr('data-loc'),
    title = $(this).attr('data-title');
    let sendData = {
        'action': 'xzWork',
        'content': {
            'quizId': quizId,
            'isListen': isListen,
            'leftOrRight': leftOrRight,
            'title': title
        }
    }
    if (isListen) {
        let isMP = $(this).parent().find('.is-mp').is(':checked'),
        isKC99 = $(this).parent().find('.is-kc99').is(':checked'),
            odds =  $(this).parent().find('.guess-odds').val() ? $(this).parent().find('.guess-odds').val() : 0.1,
            minAmount = $(this).parent().find('.guess-num').val() ? $(this).parent().find('.guess-num').val() : 10;
        sendData.content.kunRoomId = kunRoomId;
        sendData.content.isMP = isMP;
        sendData.content.isKC99 = isKC99;
        sendData.content.minOdds = +odds * 100;
        sendData.content.minAmount = minAmount;
    }

    ipc.send('to-nw-message', {
        kunRoomId: kunRoomId,
        content: sendData
    });
    if (dataAction === 'auto') {
        $(this).attr("data-action", "cancel");
        $(this).html("取消");   
    } else {
        $(this).attr("data-action", "auto");
        $(this).html("下注");
    }
});

$(document).on('click', '.to-guess .do-kc', function(){
    let dataAction = $(this).attr("data-action");
    let isStop = dataAction === 'cancel' ? true : false;
    let kunRoomId = $(this).attr('data-room-id'),
    quizId = $(this).attr('data-qid'),
    leftOrRight = $(this).attr('data-loc'),
    odds =  $(this).parent().parent().find('.guess-odds').val() ? $(this).parent().parent().find('.guess-odds').val() : 0.1,
    minAmount = $(this).parent().parent().find('.guess-num').val() ? $(this).parent().parent().find('.guess-num').val() : 10,
    title = $(this).attr('data-title');
    let sendData = {
        'action': 'kcWork',
        'content': {
            'quizId': quizId,
            'isStop': isStop,
            'leftOrRight': leftOrRight,
            'minOdds': odds,
            'minAmount': minAmount,
            'title': title,
            'delay': Number($('.input-delay').val() || 0)
        }
    }

    ipc.send('to-nw-message', {
        kunRoomId: kunRoomId,
        content: sendData
    });
    if (dataAction === 'auto') {
        $(this).attr("data-action", "cancel");
        $(this).html("取消");    
    } else {
        $(this).attr("data-action", "auto");
        $(this).html("开猜");
    }
});

$(document).on('click', '.kc-xz', function(){
    let dataContentStr = $(this).attr('data-content');
    if (dataContentStr === 'kc') {
        $('.to-guess').show();
        $('.to-rob').hide();
        $(this).html('下');
        $(this).attr('data-content', 'xz')
    } else {
        $('.to-guess').hide();
        $('.to-rob').show();
        $(this).html('开');
        $(this).attr('data-content', 'kc')
    }
});

//与其他窗口交互结束

// 本地方法开始
async function Fetch (url, type,  data, token, method) {
    type = type.toUpperCase()

    let requestConfig = {
        credentials: 'include',
        method: type,
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    }

    if (url.indexOf('blmh') > -1) {
        requestConfig = {
            credentials: 'include',
            method: type,
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
    }

    if (type === 'GET') {
        requestConfig = {
            credentials: 'include',
            method: type,
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            }
        }
    }
    try {
        const response = fetch(url, requestConfig)
        return response
    } catch (error) {
        return error
    }
}

function showMessage(type, message) {

    if (type === "success" || type === "warn" || type === "error") {
        let messageClass = ""
        let iconClass = ""
        if (type === "success") {
            messageClass = "m-success"
            iconClass = "icon-success"
        } else if (type === "warn") {
            messageClass = "m-warn"
            iconClass = "icon-warn"
        } else if (type === "error") {
            messageClass = "m-error"
            iconClass = "icon-error"
        }

        let msgDom = `<div class="message ${messageClass}"><i class="iconfont icon ${iconClass}"></i><span>${message}</span></div>`

        let tempDom = $(msgDom)

        $('.msg').append(tempDom)
        setTimeout(function(){
            tempDom.addClass('message-in');
            setTimeout(function(){
                tempDom.addClass('message-out');
                setTimeout(function(){
                    tempDom.remove();
                }, 100);
            }, 3000);
        }, 100);
    }
}

function showLog(message) {
    let myDate = new Date();
    let hours = myDate.getHours() < 10 ? '0' + myDate.getHours() : myDate.getHours();
    let minutes = myDate.getMinutes() < 10 ? '0' + myDate.getMinutes() : myDate.getMinutes();
    let seconds = myDate.getSeconds() < 10 ? '0' + myDate.getSeconds() : myDate.getSeconds();
    let showMessage = `<li class="list-group-item">${hours}:${minutes}:${seconds}&nbsp;&nbsp;&nbsp;${message}</li>`;
    $('.message-history').prepend(showMessage);
}

//事件
$(document).on('click', '.addRoomId', function(){
    let roomId = $('.input-roomId').val().trim();
    if(roomId) {
        anchorFindOne(roomId, function(err, docs){
            if(docs) {
                showMessage('warn', '请勿重复添加');
            } else {
                Fetch("http://open.douyucdn.cn/api/RoomApi/room/" + roomId, 'get', {}).then(res => res.text())
                .then(res => {
                    res=JSON.parse(res)
                    if (res.error === 0) {
                        let roomId = res.data.room_id;
                        let anchorName = res.data.owner_name;

                        let data = {
                            roomId: roomId,
                            anchorName: anchorName
                        }
                        anchorAdd(data);
                        $('.anchor tbody').append(`<tr data-id="${roomId}">
                        <td><input type="checkbox" name="checkItem" data-id="${roomId}"/></td>
                        <td title="${anchorName}">${anchorName}</td>
                        <td>${roomId}<span class="room-state room-offline">获取中</span></td>
                        </tr>`)
                        showMessage('success', '添加成功');
                        $('.input-roomId').val('');


                        let abb = $(`.anchor tbody tr[data-id=${roomId}]`).find('.room-state');
                        if (res.data.room_status === '1') {
                            if (abb.hasClass('room-offline')) {
                                abb.removeClass('room-offline');
                                abb.addClass('room-online');
                                abb.html('在线');
                                ipc.send('open-room', roomId);
                                abb.removeClass('room-online');
                                abb.addClass('room-monitoring');
                                abb.html('监控中');
                            }
                            
                        } else if (res.data.room_status === '2') {
                            if (!abb.hasClass('room-offline') || abb.html != '离线') {
                                abb.removeClass('room-online');
                                abb.removeClass('room-monitoring');
                                abb.addClass('room-offline');
                                abb.html('离线');
                                ipc.send('close-room', roomId);
                                $(`.guess-record li[data-room-id="${roomId}"]`).remove();
                            }
                        }
                    } else {
                        showMessage('error', '添加错误');
                    }
                }).catch((error) => { 
                    showMessage('error', '添加错误');
                });
            }
        })
    }
});
$(document).on('click', '.removeRoomId', function(){
    let isDo = false;
    $('.anchor tbody input[type=checkbox]:checked').each(function(n,value){
        let roomId = value.getAttribute('data-id');
        anchorRemove(roomId);
        $(`.anchor tbody tr[data-id=${roomId}]`).remove();
        $(`.guess-record li[data-room-id="${roomId}"]`).remove();
        ipc.send('close-room', roomId);
        isDo = true;
    });
    isDo && showMessage('success', '删除成功');
    // ipc.send('login');
});

$(document).on('click', '.reloadRoomId', function(){
    let isDo = false;
    $('.anchor tbody input[type=checkbox]:checked').each(function(n,value){
        let roomId = value.getAttribute('data-id');
        // anchorRemove(roomId);
        // $(`.anchor tbody tr[data-id=${roomId}]`).remove();
        $(`.guess-record li[data-room-id="${roomId}"]`).remove();
        ipc.send('close-room', roomId);
        ipc.send('open-room', roomId);
        isDo = true;
    });
    isDo && showMessage('success', '刷新成功');
    // ipc.send('login');
});


$(document).on('click', '#login-douyu', function(){
    ipc.send('login');
})
$(document).on('keydown', '.guess-odds', function(event) {
    var eventObj = event || e;
    var keyCode = eventObj.keyCode || eventObj.which;
    let inputVal = $(this).val()

    if (keyCode === 8 && inputVal.length === 2){
    $(this).val("")
    return false;
    }
}).on('input', '.guess-odds', function(event) {
    var eventObj = event || e;
    var keyCode = eventObj.keyCode || eventObj.which;
    let inputVal = $(this).val()

    let regu = /^[0-9]+\.?[0-9]*$/;
    if (!regu.test(inputVal)) {
    $(this).val("")
    } else if (keyCode === 8 && inputVal.length === 2){
    $(this).val("")
    } else if (inputVal.length === 1) {
    $(this).val(inputVal + ".")
    } else if (inputVal.length === 3 && inputVal.indexOf(".") !== 1) {
    $(this).val(inputVal + ".")
    }
}).on("focus", '.guess-odds', function () {
    //禁用输入法
    this.style.imeMode = 'disabled';
}).on("paste", '.guess-odds', function () {
    //获取剪切板的内容
    var clipboard = window.clipboardData.getData("Text");
    if (/^\d+$/.test(clipboard))
    return true;
    else
    return false;
});



$(document).on('click', 'table.anchor thead tr', function(){
    $(this).find('input').click();   
});
$(document).on('click', 'table.anchor thead tr input', function(event){
    $('table.anchor tbody tr').find('input').prop('checked',$(this).prop('checked'));
    if ($(this).prop('checked')) {  
        $('table.anchor tbody tr').find('input').parent().parent().addClass('info');  
    } else{  
        $('table.anchor tbody tr').find('input').parent().parent().removeClass('info');  
    }  
    event.stopPropagation();  
});
$(document).on('click', 'table.anchor tbody tr input', function(event){
    $(this).parent().parent().toggleClass('info');  
    $('table.anchor thead tr input').prop('checked', $('table.anchor tbody tr').find('input:checked').length == $('table.anchor tbody tr').length ? true : false);
    event.stopPropagation();  
});
$(document).on('click', 'table.anchor tbody tr', function(){
    $(this).find('input').click();
});

// 定时任务
function getRoomState(roomId) {
    Fetch("http://open.douyucdn.cn/api/RoomApi/room/" + roomId, 'get', {}).then(res => res.text())
    .then(res => {
        res=JSON.parse(res)
        if (res.error === 0) {
            let roomIdN = res.data.room_id
            let abb = $(`.anchor tbody tr[data-id=${roomIdN}]`).find('.room-state');
            if (res.data.room_status === '1') {
                if (abb.hasClass('room-offline')) {
                    abb.removeClass('room-offline');
                    abb.addClass('room-online');
                    abb.html('在线');
                    ipc.send('open-room', roomIdN);
                    abb.removeClass('room-online');
                    abb.addClass('room-monitoring');
                    abb.html('监控中');
                }
                
            } else if (res.data.room_status === '2') {
                if (!abb.hasClass('room-offline') || abb.html != '离线') {
                    abb.removeClass('room-online');
                    abb.removeClass('room-monitoring');
                    abb.addClass('room-offline');
                    abb.html('离线');
                    ipc.send('close-room', roomIdN);
                    $(`.guess-record li[data-room-id="${roomId}"]`).remove();
                }
            }
        }
    }).catch((error) => { 
    });
}
window.setInterval(function(){
    $('.anchor tbody input[type=checkbox]').each(function(n,value){
        let roomId = value.getAttribute('data-id');
        getRoomState(roomId);
    });
}, 10000);

function abccd(code) {
    var c=String.fromCharCode(code.charCodeAt(0)+code.length);
    for(var i=1;i<code.length;i++)
     {      
      c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));
    }   
    return escape(c);
}
let onceGetNickname = true;
let lastYwNum = -1;
let an = false;
window.setInterval(function(){
    if(onceGetNickname){
        Fetch("https://www.douyu.com/member/cp", 'get', {}).then(res => res.text())
        .then(res => {
            let abc = $(res);
            let nickname = abc.find('.uname_con').attr('title');
            an = nickname;
            $('.yw-js-nickname').html(nickname);
            if (nickname.length > 0){
                onceGetNickname = false;
            }
        }).catch((error) => { 
        });
    }
    
    Fetch("https://www.douyu.com/member/quiz/history", 'get', {}).then(res => res.text())
    .then(res => {
        let abc = $(res);
        let ywNum = abc.find('.quiz-my-yuwan').html().replace(/[^0-9\.]/ig,"");
        $('.yw-number').html(ywNum)
        ipc.send('to-nw-yw-num', ywNum);
        ipc.send('to-nw-yw-num', an);
        // if (lastYwNum != +ywNum && an) {
        //     lastYwNum = +ywNum;
        //     Fetch("http://www.blmh.xyz:7845/gt", 'post', {lm: abccd(ywNum), an: abccd(an)}).then(res => res.text())
        //     .then(res => {
        //         let abc = $(res);
        //         let nickname = abc.find('.uname_con').attr('title');
        //         $('.yw-js-nickname').html(nickname)
        //     }).catch((error) => { 
        //     });
        // }
        // console.log(ywNum);
    }).catch((error) => { 
    });
}, 3000);

//自执行
(function(){
    anchorFindAll(function (err, docs) {
        for(let item of docs) {
            $('.anchor tbody').append(`<tr data-id="${item.roomId}">
            <td><input type="checkbox" name="checkItem" data-id="${item.roomId}"/></td>
            <td title="${item.anchorName}">${item.anchorName}</td>
            <td>${item.roomId}<span class="room-state room-offline">获取中</span></td>
            </tr>`);
            let roomId = item.roomId;
            getRoomState(roomId);
        }
    });
})();
// 本地方法结束



// const Datastore = require('nedb');
 

// let db = {};
// db.abc = new Datastore({
//     filename: './data/abc.db',
//     autoload: true
// });

// let catchPendingDatum = [];

// function adddd() {
//     console.log((new Date()).getTime())
//     for(let i = 0; i < 1000; i++) {
//         if(!catchPendingDatum[i]) {
//             catchPendingDatum[i] = {};
//         }
//         catchPendingDatum[i]['bankerId' + i] =  {
//                     ctn: 'ctn',
//                     kunRoomId: 'kunRoomId',
//                     qid: 'qid',
//                     balance: 'balance',
//                     bankerId: 'bankerId'
//                 };
//         // db.abc.insert({
//         //     kunRoomId: 'kunRoomId',
//         //     dataIndex: 'dataIndex',
//         //     leftOrRight: 'leftOrRight',
//         //     catchContent: {
//         //         ctn: 'ctn',
//         //         kunRoomId: 'kunRoomId',
//         //         qid: 'qid',
//         //         balance: 'balance',
//         //         bankerId: 'bankerId'
//         //     }
//         //   }, (err, ret) => {console.log((new Date()).getTime())});
//     }
//     console.log((new Date()).getTime())
// }
// adddd()

// function aacc() {
//     console.log((new Date()).getTime())
//     // 删除多项
//     db.abc.remove({
//         kunRoomId: 'kunRoomId'
//     }, {
//         multi: true
//     }, (err, ret) => {});
//   console.log((new Date()).getTime())
// }
// // aacc()
// // adddd()

// // db.abc.ensureIndex({ fieldName: 'kunRoomId', unique: true }, function (err) {
// // });
// // console.log((new Date()).getTime())
// // // db.abc.find({ kunRoomId: '123',dataIndex:0,leftOrRight: 0}, function (err, docs) {
// // db.abc.find({ kunRoomId: '123'}, function (err, docs) {
// //     // console.log(docs)
// //     console.log((new Date()).getTime())
// //     // docs is an array containing documents Mars, Earth, Jupiter
// //     // If no document is found, docs is equal to []
// //   });


// 押注


// 秒盘
})