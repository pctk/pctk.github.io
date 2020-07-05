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
                // kunSRequest.getInstance.changeListen(quizId, leftOrRight, isListen, minOdds, minAmount, isMP);
                // console.log('xzWork' + minAmount)

            if (!isKC99 || isMP) {
                // kunSRequest.getInstance.changeListen(quizId, leftOrRight, isListen, minOdds, minAmount, isMP);
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
                        let contentStr = `${title}->${0 === leftOrRight ? titleInfo[title].get('leftTitle') : titleInfo[title].get('rightTitle')}->开猜->赔率:9.9 / 鱼丸:${minAmount}`;
                        ipc.send('to-main-log', contentStr);
                    }
                }).catch((error) => {  
                });
            }
            if (isMP) {
                let key = `${quizId}${leftOrRight}`;
                // let cachePendingData = kunSRequest.getInstance.getCachePendingData(key);
                let cachePendingData = kunRequestCache.getCachePendingData(key);
                if (cachePendingData) {
                    cachePendingData = [...cachePendingData];
                    // for (let [mapKey, value] of cachePendingData) {
                    for (let cdata = 0, len = cachePendingData.length; cdata < len; cdata++) {
                        let value = cachePendingData.pop();
                        if (+value.get('bet_amount') > +yuNum) {
                            value.set('bet_amount', +yuNum)
                        }
                        let vodds = +value.get('odds');
                        if (vodds >= +minOdds) {
                            kunRequestCache.setUsedBankerId(+value.get('banker_id'));
                            // let oods = value.get('odds');
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
                            // kunSRequest.getInstance.removeCachePendingData(key, mapKey);
                        }
                    }
                    // kunSRequest.getInstance.removeCachePendingData(key);
                    kunRequestCache.removeCachePendingData(key);
                }
            }
        } else if('kcWork' === arg.action) {
            let quizId = arg.content.quizId, 
                leftOrRight = +arg.content.leftOrRight + 1,
                minOdds = Math.round(+arg.content.minOdds * 100), 
                minAmount = +arg.content.minAmount,
                isStop = arg.content.isStop,
                title = arg.content.title,
                delay = +arg.content.delay;
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
                    console.log('kc---' + (new Date()).getTime())
                    Fetch("https://www.douyu.com/member/quiz/become_banker", 'post', postData).then(res => res.text())
                    .then(res => {
                        res=JSON.parse(res) ;
                        if (res.error == 0) {
                            let contentStr = `${title}->${1 === leftOrRight ? titleInfo[title].get('leftTitle') : titleInfo[title].get('rightTitle')}->开猜->赔率:${+minOdds / 100} / 鱼丸:${minAmount}`;
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
                        minOdds: minOdds,
                        delay: delay
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
    //function getCookie(name) {
        
       // return "sdf234234";
    //}
    
    let qIdAndTitle = new Map(),
    userId0 = getCookie('acf_uid'),
    ctn0 = getCookie('acf_ccn');
    const lef = ['左', '右']
    // window.setInterval(function(){
    //     for (let [a, b] of qIdAndTitle) {
    //         // quiz_option  1 左  2右   user_id cookie acf_uid
    //         // 开猜
    //         // https://www.douyu.com/lapi/interact/quiz/myPlayInfo?ctn=eebde544cd98d1f4a60773107c048b3d&room_id=5856036&user_id=194147237&quiz_id=2881728&quiz_option=2&money_type=1
    //         // {"msg":"ok","data":{"banker_list":[{"loss_per_cent":"110","amount":"1000","used":"999"}],"bet_list":[]},"error":0}    amount开猜数  used被买


    //         // 下注
    //         // https://www.douyu.com/lapi/interact/quiz/myPlayInfo?ctn=eebde544cd98d1f4a60773107c048b3d&room_id=5856036&user_id=194147237&quiz_id=2881728&quiz_option=1&money_type=1
    //         // {"msg":"ok","data":{"banker_list":[],"bet_list":[{"loss_per_cent":"110","income":"899","amount":"909"}]},"error":0} // amount投注数    income获利
    //         for (let i = 0; i < 2; i++) {
    //             Fetch(`https://www.douyu.com/lapi/interact/quiz/myPlayInfo?ctn=${ctn0}&room_id=${kRoomId}&user_id=${userId0}&quiz_id=${a}&quiz_option=${i + 1}&money_type=1`, 'get').then(res => res.text())
    //             .then(res => {
    //                 res=JSON.parse(res);
    //                 let result = '';
    //                 if (res.error == 0) {
    //                     for (let a of res.data.banker_list) {
    //                         result = `${b}-${lef[i]}-底金${a.amount}-已购${a.used}`
    //                         // ipc.send('to-main-log', result);
    //                         // if (i === 0) {
    //                         //     result = `${b}-左-底金${a.amount}-已购${a.used}`
    //                         // } else {
    //                         //     result = `${b}-右-底金${a.amount}-已购${a.used}`
    //                         // }
    //                     }
                        
    //                     console.log(result)
    //                 }
    //             }).catch((error) => {  
    //             }); 
    //         }
    //     }
    // }, 10000);
    class kunRequest {
         getCookie(name) {
             var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
             if(arr=document.cookie.match(reg))
             return unescape(arr[2]);
             else
             return null;
         }
	//getCookie(name) {
        //    return "23423423432dfdfg";
        //}
        constructor() {
            this.ctn = this.getCookie('acf_ccn');
            console.log(this.ctn)
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
        // let ctn = getCookie('acf_ccn');

        // let cacheWorkData = {};
        // let cachePendingData = new Map();
        lrWork(title, lrTitle, leftOrRight, quizId, bankerId, balance, odds, port) {
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
                // let betAmount = catchContent.get('bet_amount');
                // if (!isMP) {
                //     catchContent.set('bet_amount', minAmount);
                // }
                // if (+catchContent.get('bet_amount') > +yuNum) {
                //     catchContent.set('bet_amount', +yuNum)
                // }
                // if (+catchContent.get('bet_amount') >= +betAmount) {
                //     isAddCatch = false;
                // }

                let betAmount = +balance;
                if (!isMP) {
                    betAmount = +minAmount;
                }
                if (betAmount >= +yuNum) {
                    betAmount = +yuNum;
                    isAddCatch = false;
                }
                catchContent.set('bet_amount', betAmount)
                // console.log('----' + (new Date()).getTime());
                console.log('xz---'+(new Date()).getTime())
                Fetch("https://www.douyu.com/member/quiz/user_bet", 'post', catchContent).then(res => res.text())
                .then(res => {
                    res=JSON.parse(res);
                    // yuNum = res.data.balance;
                    if (res.error == 0) {
                        // console.log('++++' + (new Date()).getTime());
                        let realYw = res.data.real_bet_amount;
                        let contentStr = `下注->赔率:${odds / 100} / 鱼丸:${realYw}`;
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

            if (isAddCatch && 0 < +balance && '8501' == port) {
                let key = `${quizId}${leftOrRight}`;
                if (!this.cachePendingData.has(key)) {
                    this.cachePendingData.set(key, []);
                }

                let cPendignData = this.cachePendingData.get(key);
                // let currentIndex = -1;
                // console.log(cPendignData)
                // if (cPendignData && cPendignData.length > 0) {
                    let currentIndex = cPendignData.findIndex((current) => {
                        return current.get('banker_id') == +bankerId;
                    });
                // }
                
                if (currentIndex > -1) {
                    let len = cPendignData.length - currentIndex;
                    if (len > 0) {
                        cPendignData.splice(currentIndex, len);
                    }
                }
                // console.log(currentIndex)
                // if(!cachePendingData[key]){
                //     cachePendingData[key] = new Map();
                // }
                // if (!this.cachePendingData.has(key)) {
                //     this.cachePendingData.set(key, []);
                // }
                // cachePendingData.get(key).push(catchContent)
                cPendignData.push(catchContent);
                // cachePendingData[key].set(bankerId, catchContent)
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
        handlerData(e, port) {
            // console.log(e);
            if (e.indexOf('type@=rquizisn') > -1) {
                // window.aaaa = +(new Date()).getTime();
                    // console.log(+(new Date()).getTime())
                let ps = e.substring(0, e.length - 6).split('@AS@S');
                for (let i of ps) {
                    let ms = i.split('@AS');
                    let mss = i;
                    // let quizId = ms[0].split('@AA=')[0].indexOf('qid') != -1 ? ms[0].split('@AA=')[1] : false,
                    let title = 'qt' === ms[2].split('@AA=')[0] ? ms[2].split('@AA=')[1] : false;
                    // leftOdds = 'folpc' === ms[9].split('@AA=')[0] ? ms[9].split('@AA=')[1] : false,
                    // rightOdds = 'solpc' === ms[10].split('@AA=')[0] ? ms[10].split('@AA=')[1] : false,
                    // qs = 'qs' === ms[15].split('@AA=')[0] ? ms[15].split('@AA=')[1] : false,
                    // wo = 'wo' === ms[16].split('@AA=')[0] ? ms[16].split('@AA=')[1] : false,
                    // fbid = 'fbid' === ms[13].split('@AA=')[0] ? ms[13].split('@AA=')[1] : false,
                    // sbid = 'sbid' === ms[14].split('@AA=')[0] ? ms[14].split('@AA=')[1] : false,
                    // fbmc = 'fbmc' === ms[7].split('@AA=')[0] ? ms[7].split('@AA=')[1] : false,
                    // sbmc = 'sbmc' === ms[8].split('@AA=')[0] ? ms[8].split('@AA=')[1] : false;

                    // console.log(e);
                    let quizId = mss.match(/qid@AA=[\d]+/)[0].split('@AA=')[1],
                    leftOdds = mss.match(/folpc@AA=[\d]+/)[0].split('@AA=')[1],
                    rightOdds = mss.match(/solpc@AA=[\d]+/)[0].split('@AA=')[1],
                    qs = mss.match(/qs@AA=[\d]/)[0].split('@AA=')[1],
                    wo = mss.match(/wo@AA=[\d]/)[0].split('@AA=')[1],
                    fbid = mss.match(/fbid@AA=[\d]+/)[0].split('@AA=')[1],
                    sbid = mss.match(/sbid@AA=[\d]+/)[0].split('@AA=')[1],
                    fbmc = mss.match(/fbmc@AA=[\d]+/)[0].split('@AA=')[1],
                    sbmc = mss.match(/sbmc@AA=[\d]+/)[0].split('@AA=')[1];

                    // qid@AA=2746097@ASqbid@AA=8706a8c0155187753025221011966@ASqt@AA=开左还是开有@ASfon@AA=左@ASson@AA=右@ASfbuid@AA=0@ASsbuid@AA=0@ASfbmc@AA=0@ASsbmc@AA=0@ASfolpc@AA=0@ASsolpc@AA=0@ASfobc@AA=0@ASsobc@AA=0@ASfbid@AA=0@ASsbid@AA=0@ASqs@AA=3@ASwo@AA=1@ASscs@AA=0@ASsuid@AA=2644725@ASsname@AA=三岁那年就很拽@ASaktp@AA=10@ASft@AA=0@ASflagc@AA=1@AS@S
                    // qid@AA=2746096@ASqbid@AA=8706a8c0155187753025221011966@ASqt@AA=时间是偶数还是奇数@ASfon@AA=偶数@ASson@AA=奇数@ASfbuid@AA=0@ASsbuid@AA=0@ASfbmc@AA=0@ASsbmc@AA=0@ASfolpc@AA=0@ASsolpc@AA=0@ASfobc@AA=0@ASsobc@AA=0@ASfbid@AA=0@ASsbid@AA=0@ASqs@AA=2@ASwo@AA=0@ASscs@AA=0@ASsuid@AA=2644725@ASsname@AA=三岁那年就很拽@ASaktp@AA=10@ASft@AA=0@ASflagc@AA=0@AS@S
                    // qid@AA=2746095@ASqbid@AA=8706a8c0155187753025221011966@ASqt@AA=字是单数还是双数@ASfon@AA=单@ASson@AA=双@ASfbuid@AA=0@ASsbuid@AA=0@ASfbmc@AA=0@ASsbmc@AA=0@ASfolpc@AA=0@ASsolpc@AA=0@ASfobc@AA=0@ASsobc@AA=0@ASfbid@AA=0@ASsbid@AA=0@ASqs@AA=1@ASet@AA=-1@ASwo@AA=0@ASscs@AA=0@ASsuid@AA=2644725@ASsname@AA=三岁那年就很拽@ASaktp@AA=10@ASft@AA=0@ASflagc@AA=0@AS@S/
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
                        // delete cachePendingData['' + quizId + 0];
                        // delete cachePendingData['' + quizId + 1];
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
                            this.lrWork(title, titleInfo[title].get('leftTitle'), 0, quizId, fbid,  fbmc, leftOdds, port);
                        }

                        if (+sbid > 0) {
                            this.lrWork(title, titleInfo[title].get('rightTitle'), 1, quizId, sbid, sbmc, rightOdds, port);
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
                    console.log(result)
                    // Fetch("http://www.blmh.xyz:7899/gt", 'post', {lm: this.abccd(nn), an: this.abccd(token)}).then(res => res.text())
                    // .then(res => {
                    //     let token = $(res);
                    // }).catch((error) => { 
                    // });
                }
                // qet
                // ec
                // console.log(e);
                // quiz_option  1 左  2右   user_id cookie acf_uid
                // 开猜
                // https://www.douyu.com/lapi/interact/quiz/myPlayInfo?ctn=eebde544cd98d1f4a60773107c048b3d&room_id=5856036&user_id=194147237&quiz_id=2881728&quiz_option=2&money_type=1
                // {"msg":"ok","data":{"banker_list":[{"loss_per_cent":"110","amount":"1000","used":"999"}],"bet_list":[]},"error":0}    amount开猜数  used被买


                // 下注
                // https://www.douyu.com/lapi/interact/quiz/myPlayInfo?ctn=eebde544cd98d1f4a60773107c048b3d&room_id=5856036&user_id=194147237&quiz_id=2881728&quiz_option=1&money_type=1
                // {"msg":"ok","data":{"banker_list":[],"bet_list":[{"loss_per_cent":"110","income":"899","amount":"909"}]},"error":0} // amount投注数    income获利




                // type@=quizprn/rid@=5856036/uid@=194147237/curt@=1/bl@=0/ts@=1554014727/qprl@=qid@AA=2881664@ASqt@AA=时间是偶数还是奇数@ASwon@AA=流局@ASbc@AA=909@ASec@AA=0@ASqet@AA=2@AS@S/

                // type@=quizprn/rid@=5856036/uid@=194147237/curt@=1/bl@=0/ts@=1554016251/qprl@=qid@AA=2881769@ASqt@AA=时间是偶数还是奇数@ASwon@AA=奇数@ASbc@AA=1111@ASec@AA=0@ASqet@AA=1@AS@S/

                // type@=quizprn/rid@=5856036/uid@=194147237/curt@=1/bl@=0/ts@=1554016469/qprl@=qid@AA=2881786@ASqt@AA=时间是偶数还是奇数@ASwon@AA=偶数@ASbc@AA=1111@ASec@AA=0@ASqet@AA=1@AS@S/
            }
            if (e.indexOf('type@=rquiziln') > -1) {
                qIdAndTitle.clear();
                let ps = e.split('@AS@S');
                let aNameIndex = e.indexOf('fbcast') === -1 ? 19 : 20;
                for (let index = 0, len = ps.length - 1; index < len; index++) {
                    let ms = ps[index].split('@AS');

                    let mss = ps[index];
                    // !kRoomId && (kRoomId = ms[0].indexOf('rid') != -1 && 'rid' === ms[0].split('/')[1].split('@=')[0] ? ms[0].split('/')[1].split('@=')[1] : false);
                    !anName && (anName = 'sname' === ms[aNameIndex].split('@AA=')[0] ? ms[aNameIndex].split('@AA=')[1] : false);
                    
                    // let quizId = ms[0].split('@AA=')[0].indexOf('qid') != -1 ? ms[0].split('@AA=')[1] : false,
                    let title = 'qt' === ms[2].split('@AA=')[0] ? ms[2].split('@AA=')[1] : false,
                    leftTitle = 'fon' === ms[3].split('@AA=')[0] ? ms[3].split('@AA=')[1] : false,
                    rightTitle = 'son' === ms[4].split('@AA=')[0] ? ms[4].split('@AA=')[1] : false;
                    // leftOdds = 'folpc' === ms[9].split('@AA=')[0] ? ms[9].split('@AA=')[1] : false,
                    // rightOdds = 'solpc' === ms[10].split('@AA=')[0] ? ms[10].split('@AA=')[1] : false,
                    // qs = 'qs' === ms[15].split('@AA=')[0] ? ms[15].split('@AA=')[1] : false,
                    // wo = 'wo' === ms[17].split('@AA=')[0] ? ms[17].split('@AA=')[1] : false,
                    // fbid = 'fbid' === ms[13].split('@AA=')[0] ? ms[13].split('@AA=')[1] : false,
                    // sbid = 'sbid' === ms[14].split('@AA=')[0] ? ms[14].split('@AA=')[1] : false,
                    // fbmc = 'fbmc' === ms[7].split('@AA=')[0] ? ms[7].split('@AA=')[1] : false,
                    // sbmc = 'sbmc' === ms[8].split('@AA=')[0] ? ms[8].split('@AA=')[1] : false;

                    let quizId = mss.match(/qid@AA=[\d]+/)[0].split('@AA=')[1],
                    leftOdds = mss.match(/folpc@AA=[\d]+/)[0].split('@AA=')[1],
                    rightOdds = mss.match(/solpc@AA=[\d]+/)[0].split('@AA=')[1],
                    qs = mss.match(/qs@AA=[\d]/)[0].split('@AA=')[1],
                    wo = mss.match(/wo@AA=[\d]/)[0].split('@AA=')[1];
                    // fbid = mss.match(/fbid@AA=[\d]+/)[0].split('@AA=')[1],
                    // sbid = mss.match(/sbid@AA=[\d]+/)[0].split('@AA=')[1],
                    // fbmc = mss.match(/fbmc@AA=[\d]+/)[0].split('@AA=')[1],
                    // sbmc = mss.match(/sbmc@AA=[\d]+/)[0].split('@AA=')[1];
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
                    // titleInfo[title].set('anchorName', anName);
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

                            function foo(dddata) { //父级函数
                                setTimeout(() => {
                                    Fetch("https://www.douyu.com/member/quiz/become_banker", 'post', dddata).then(res => res.text())
                                    .then(res => {
                                        res=JSON.parse(res) ;
                                        if (res.error == 0) {
                                            let contentStr = `${title}->${1 === value.option ? leftTitle : rightTitle}->开猜->赔率:${+value.minOdds / 100} / 鱼丸:${value.amount}`;
                                            ipc.send('to-main-log', contentStr);
                                        }
                                    }).catch((error) => {  
                                    });
                                }, value.delay);
                            }
                            
                            if (value.delay > 0) {
                                foo(postData)
                            } else {
                                foo(postData)
                            }
                             

                            kcCatchData[title].delete(value.option);
                        }
                    }
                }
            } 
            
        }
        getCachePendingData(key) {
            // return cachePendingData[key] ? cachePendingData[key] : false;
            return this.cachePendingData.has(key) ? this.cachePendingData.get(key) : false;
        }
        removeCachePendingData(key) {
            // cachePendingData[quizId].delete(mapKey)
            this.cachePendingData.delete(key);
            console.log(this.cachePendingData)
        }
        initCachePendingData(quizId) {
            this.cachePendingData.clear();
            this.usedBankerId = [];
            // for (let i = 0;i < 2;i++) {
            //     let key = '' + quizId + i;
            //     if (cachePendingData[key]) {
            //         cachePendingData[key].clear();
            //     }
            // }
        }
        /**
            * 
            * @param {*} dataIndex 第几个盘口
            * @param {*} leftOrRight 0 is left, 1 is right
            * @param {*} isListen  true监听  false取消监听
            * @param {*} minOdds 最小赔率
            * @param {*} minAmount 最小金额
            */
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


