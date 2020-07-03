$(document).ready(function () {

    function Fetch (url, type,  data, token, method) {
      const win = window
      type = type.toUpperCase()
      if (type === 'GET') {
          let dataStr = '' // 数据拼接字符串
          Object.keys(data).forEach(key => {
          dataStr += key + '=' + data[key] + '&'
          })
    
          if (dataStr !== '') {
              dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'))
              url = url + '?' + dataStr
          }
      }
    
      let requestConfig = {
          credentials: 'include',
          method: type,
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
          },
          mode: 'cors'
      }
    
      if (type === 'POST') {
          Object.defineProperty(requestConfig, 'body', {
          value: JSON.stringify(data)
          })
      }
    
      try {
          const response = fetch(url, requestConfig)
          return response
      } catch (error) {
          return error
      }
    }
  
    const {ipcRenderer} = require('electron')
  
    // ipcRenderer.sendToHost({
    //   action: 'ready'
    // })
    let dataCacheNw = new Map();
    let dataIndexCacheNw = new Map();
  
    
    // dataCacheNw = {
    //   "68626" : {
    //     "第一把开局有没有赖子": [],
    //     "第二把开局有没有赖子": []
    //   }
    // }
  
    // dataIndexCacheNw = {
    //   "68626" : [
    //     {index: 0, roomAnchor: "小小帝帝呢", title: "第一把开局有没有赖子", leftItem: "有", rightItem: "没有"},
    //     {index: 1, roomAnchor: "小小帝帝呢", title: "第二把开局有没有赖子", leftItem: "有", rightItem: "没有"}
    //   ]
    // }
  
  
    async function sleep(ms){
      return new Promise((resolve)=>setTimeout(resolve,ms));
    }
    // let weiXinReady = true;
    // wexWindow.addEventListener('ipc-message', (event) => { //ipc-message监听，被webview加载页面传来的信息
    //     let data = event.channel;
  
    //     if ('ready' == data.action) {
    //         weiXinReady = true;
    //     }
  
    // })

    // const wxJiLuDao = require('WxJiLuDao').WxJiLuDao.getInstance();
  
    // 数据库开始
    // const Datastore = require('nedb');
    // let db = {};
    // db.mjRecords = new Datastore({
    //   // filename: 'D:/project/doyou/client/wxjilu/out_data_db/mj_records.db',
    //   filename: '../data/mj_records.db',
    //   autoload: true
    // });
    let db = require('electron').remote.getGlobal('sharedObject').db;
    
    function mjRecordsFindAll(fuc) {
      return db.mjRecords.find({}, fuc);
    }
  
    function mjRecordsFindOne(condition, fuc) {
      db.mjRecords.loadDatabase();
      return db.mjRecords.findOne(condition, fuc);
    }
      window.setInterval(function(){
        db.mjRecords.loadDatabase();
      }, 1000 * 60 * 60);

    // 初始化
    (function() {
      mjRecordsFindAll(function(err, docs) {
        for(let item of docs) {
          let roomId = +item.roomId;
          for (let resultItem in item) {
            if ('roomId' != resultItem && '_id' != resultItem) {
              if (dataCacheNw.has(roomId)) {
                let dataCacheNwItem = dataCacheNw.get(roomId)
                dataCacheNwItem.set(resultItem, item[resultItem]);
              } else {
                let dataCacheNwItem = new Map();
                dataCacheNwItem.set(resultItem, item[resultItem]);
                dataCacheNw.set(roomId, dataCacheNwItem);
              }
            }
          }
        } 
      })
    })();
  
    let sysSend = false;
    // ipcRenderer.on('wx-webview-result', async (event, arg) => {
      ipcRenderer.on('dis-result', async (event, arg) => {
      // console.log(arg);
  
      // arg = {
      //   roomId: "68626",
      //   init: [],
      //   result: {
      //     "第一把开局有没有赖子": '有',
      //     "第二把开局有没有赖子": '有'
      //   }
      // }
  
      let roomId = +arg.roomId,
      indexInit = arg.init,
      result = arg.result;
      
      dataIndexCacheNw.set(roomId, indexInit);
  
      if (dataCacheNw.has(roomId)) {
        let dataCacheNwItem = dataCacheNw.get(roomId)
        for (let titleItem in result) {
          let resultItem = result[titleItem];
          setCache(dataCacheNwItem, titleItem, resultItem)
        }
      } else {
        let dataCacheNwItem = new Map();
        for (let titleItem in result) {
          let resultItem = result[titleItem]
          setCache(dataCacheNwItem, titleItem, resultItem)
        }
        dataCacheNw.set(roomId, dataCacheNwItem);
      }
  
  
      let model = 0,
      firstData = [],
      firstLeft = '',
      secondData = [],
      secondLeft = '',
      thirdData = [],
      thirdLeft = '',
      commonData = {},
      commonLeft = {},
      roomAnchor = '';
  
     
    //   let sortResultDataFirst = [];

      console.log(`----------${indexInit.length}`)
      for (let i = 0, len = indexInit.length; i < len; i++) {
        let titleInfo = indexInit[i],
        title = titleInfo.title,
        leftItem = titleInfo.leftItem;
        roomAnchor = titleInfo.roomAnchor;
        
        if ((title.indexOf('赖子') > -1 || title.indexOf('癞子') > -1) && (title.indexOf('1') > -1 || title.indexOf('一') > -1)) {
          model = 1;
        }
  
        if (title.indexOf('队') > -1 || title.indexOf('对') > -1 || title.indexOf('刻') > -1) {
          model = 2;
        }
  
        if (title.indexOf('方位') > -1 || title.indexOf('座') > -1 || title.indexOf('坐') > -1) {
          model = 3;
        }

        if (title.indexOf('风赖') > -1 || title.indexOf('风癞') > -1) {
          model = 4;
        }
  
        if (title.indexOf('三风') > -1 || title.indexOf('三张风') > -1) {
          model = 5;
        }
  
        let dataCacheNwItem = dataCacheNw.get(roomId);

        // if (dataCacheNwItem.get(title)) {
        //     sortResultDataFirst.push(...dataCacheNwItem.get(title));
        // }

        
        if (title.indexOf('1') > -1 || title.indexOf('一') > -1) {
          firstData = dataCacheNwItem.get(title);
          firstLeft = leftItem;
        } else if (title.indexOf('2') > -1 || title.indexOf('二') > -1) {
          secondData = dataCacheNwItem.get(title);
          secondLeft = leftItem;
        } else if (title.indexOf('3') > -1 || title.indexOf('三') > -1) {
          thirdData = dataCacheNwItem.get(title);
          thirdLeft = leftItem;
        } else {
          commonData[title] = dataCacheNwItem.get(title);
          commonLeft[title] = leftItem;
        }
        
      }

    //   sortResultDataFirst = sortResultDataFirst.sort(function(a, b){
    //     a = a.split('-')[0];
    //     b = b.split('-')[0];
    //     if (a < b) {
    //         return -1;
    //     } else if (a > b) {
    //         return 1;
    //     } else {
    //         return 0;
    //     }
    //   });
  
      let resultData = {};
      let resultStarData = {};
      if (1 === model || 2 === model || 3 == model || 4 == model || 5 == model) {
        let resultItemData = [];
        let resultItemStarData = [];
        // for (let i = 0, len = sortResultDataFirst.length; i < len; i++) {
        //     resultItemData.push(sortResultDataFirst[i].split('-')[1] == firstLeft ? 1 : sortResultDataFirst[i].split('-')[1] == 'flow' ? 0 : 2);
        //     resultItemStarData.push(sortResultDataFirst[i].split('-')[1] == firstLeft ? "★" : sortResultDataFirst[i].split('-')[1] == 'flow' ? "○" : "☆");
        // }
        
        
        for (let i = 0, len = firstData.length; i < len; i++) {
          if (firstData && firstData[i]) {
            resultItemData.push(firstData[i].split('-')[1] == firstLeft ? 1 : firstData[i].split('-')[1] == 'flow' ? 0 : 2);
            resultItemStarData.push(firstData[i].split('-')[1] == firstLeft ? "★" : firstData[i].split('-')[1] == 'flow' ? "○" : "☆");
          }
  
          if (secondData && secondData[i]) {
            resultItemData.push(secondData[i].split('-')[1] == secondLeft ? 1 : secondData[i].split('-')[1] == 'flow' ? 0 : 2);
            resultItemStarData.push(secondData[i].split('-')[1] == secondLeft ? "★" : secondData[i].split('-')[1] == 'flow' ? "○" : "☆");
          }
  
          if (thirdData && thirdData[i]) {
            resultItemData.push(thirdData[i].split('-')[1] == thirdLeft ? 1 : thirdData[i].split('-')[1] == 'flow' ? 0 : 2);
            resultItemStarData.push(thirdData[i].split('-')[1] == thirdLeft ? "★" : thirdData[i].split('-')[1] == 'flow' ? "○" : "☆");
          }
        }
  
        if(1 === model) {
          resultData['开局能不能赖子'] = resultItemData;
          resultStarData['开局能不能赖子'] = resultItemStarData;
        } else if (2 === model) {
          resultData['开局有没有三对'] = resultItemData;
          resultStarData['开局有没有三对'] = resultItemStarData;
        }  else if (3 === model) {
          resultData['开局方位'] = resultItemData;
          resultStarData['开局方位'] = resultItemStarData;
        }  else if (4 === model) {
          resultData['开局有没有风赖'] = resultItemData;
          resultStarData['开局有没有风赖'] = resultItemStarData;
        } else if (5 === model) {
          resultData['开局有没有三风'] = resultItemData;
          resultStarData['开局有没有三风'] = resultItemStarData;
        } else {
  
        }
      } else if (0 === model) {
        for (let commonItem in commonData) {
          let resultItemData = [];
          let resultItemStarData = [];
          let commonResult = commonData[commonItem],
          leftItem = commonLeft[commonItem];
          if (commonResult) {
            for (let i = 0, len = commonResult.length; i < len; i++) {
              resultItemData.push(commonResult[i].split('-')[1] == leftItem ? 1 : commonResult[i].split('-')[1] == 'flow' ? 0 : 2);
              resultItemStarData.push(commonResult[i].split('-')[1] == leftItem ? "★" : commonResult[i].split('-')[1] == 'flow' ? "○" : "☆");
            }
          }
          
          resultData[commonItem] = resultItemData;
          resultStarData[commonItem] = resultItemStarData;
        }
      } else {
  
      }

      let titleClient = "",
      contentNumClient = "",
      contentStarClient = "";
  
      let midStr = '';
      for (let title in resultData) {
        let result = `${title}: ${resultData[title].join('')}`
        console.log(result);
  
        let strResult = '', strStarResult = '', resultsStar = resultStarData[title],
        results = resultData[title];
        for (let i = 0, len = results.length; i < len; i++) {
          if (i != 0) {
            if (i % 9 === 0) {
              strResult += '<br>';
              strStarResult  += '<br>';
            } else if (i % 3 === 0) {
              strResult += ' ';
              strStarResult += ' ';
            }
          }
          strStarResult += resultsStar[i];
          strResult += results[i];
        }
        midStr += `${title}(第${resultData[title].length}手):<br>${strResult}<br>`;
        titleClient = `${title}(第${resultData[title].length}手)`;
        contentNumClient = strResult;
        contentStarClient = strStarResult;
      }
  
  
      while (sysSend) {
        await sleep(500);
      }
      sysSend = true;
  
      // await sleep(Math.floor(Math.random() * 500) + 1900); // 2000
  
      // ABC开始
      // let abcStr = `群内设置免打扰, 祝各位游戏愉快<br><记录时间24小时><br><br>${roomAnchor}  ➣  ${roomId}<br>`,
      // abcEndStr = '<br>买卖海鲜私聊群主<br>『本记录依据主播结算结果』';
      let abcStr = `${roomAnchor.replace(/暴Tui团丶/g, '').replace(/吃瓜群众丶/g, '')}➣${roomId}<br>`,
      abcEndStr = '进出海鲜私聊群主';
      abcStr += midStr;// + abcEndStr;
      console.log(abcStr);


      console.log("发送至微信");
      ipcRenderer.send('to-wx-msg', {
        user: "abc",
        msg: abcStr
      });
      
      // console.log("发送至abc手机");
      // await sendToABC(abcStr);

      let newAbcData = {
        "action": 1,
        "roomInfo": `${roomAnchor}：${roomId}`,
        "title": titleClient,
        "contentNum": contentNumClient,
        "contentStar": contentStarClient
      }
      console.log(newAbcData);
      console.log("发送至新abc手机");

      // todo
      await sendToABC(newAbcData);
      // ABC结束
  
      // 蓝天开始
      let lanTianStr = `群内设置免打扰, 祝各位游戏愉快<br><记录时间24小时><br><br>${roomAnchor}<br>`,
      lanTianEndStr = '<br>买卖海鲜私聊群主  百万优惠<br>☞本记录依据主播结算结果☜';
      lanTianStr += midStr + lanTianEndStr;
      // console.log(lanTianStr);
      // await sendToLanTian(lanTianStr);
      let newLanTianData = {
        "action": 1,
        "roomInfo": `${roomAnchor}：${roomId}`,
        "title": titleClient,
        "contentNum": contentNumClient,
        "contentStar": contentStarClient
      }
      console.log(newLanTianData);
      console.log("发送至新lantian手机");
      // todo
      await sendToLanTian(newLanTianData);

      // 蓝天结束

      // 微笑开始
      let weiXiaoStr = `群内设置免打扰, 祝各位游戏愉快<br><记录时间24小时><br><br>${roomAnchor}<br>`,
      weiXiaoEndStr = '<br>买卖海鲜私聊群主  百万优惠<br>☞本记录依据主播结算结果☜';
      weiXiaoStr += midStr + weiXiaoEndStr;
      // console.log(weiXiaoStr);
      // await sendToWeiXiao(weiXiaoStr);
      let newWeiXiaoData = {
        "action": 1,
        "roomInfo": `${roomAnchor}：${roomId}`,
        "title": titleClient,
        "contentNum": contentNumClient,
        "contentStar": contentStarClient
      }
      console.log(newWeiXiaoData);
      console.log("发送至新weixiao手机");
      // todo
      await sendToWeiXiao(newWeiXiaoData);

      // 微笑结束

      
      // 钢镚开始
      let gangBengStr = `群内设置免打扰, 祝各位游戏愉快<br><记录时间24小时><br><br>${roomAnchor}<br>`,
      gangBengEndStr = '<br>买卖海鲜私聊群主  百万优惠<br>☞本记录依据主播结算结果☜';
      gangBengStr += midStr + gangBengEndStr;
      let newGangBengData = {
        "action": 1,
        "roomInfo": `${roomAnchor}：${roomId}`,
        "title": titleClient,
        "contentNum": contentNumClient,
        "contentStar": contentStarClient
      }
      console.log(newGangBengData);
      console.log("发送至新gangBeng手机");
      await sendToGangBeng(newGangBengData);
      // 钢镚结束

      sysSend = false;
    });
  
    let isSend = {};
    // ipcRenderer.on('webview-go-online', async (event, arg) => {
    ipcRenderer.on('go-online', async (event, arg) => {
      let roomAnchor = arg.roomAnchor,
      roomId = arg.roomId;
  
      mjRecordsFindOne(roomId, function(err, docs) {
        if (docs) {
          let roomId = +docs.roomId;
          for (let resultItem in docs) {
            if ('roomId' != resultItem && '_id' != resultItem) {
              if (dataCacheNw.has(roomId)) {
                let dataCacheNwItem = dataCacheNw.get(roomId)
                dataCacheNwItem.set(resultItem, docs[resultItem]);
              } else {
                let dataCacheNwItem = new Map();
                dataCacheNwItem.set(resultItem, docs[resultItem]);
                dataCacheNw.set(roomId, dataCacheNwItem);
              }
            }
          }
        } 
      })
  
      console.log(`${roomId} online`)
  
      while (sysSend) {
        await sleep(500);
      }
      sysSend = true;
  
      // 蓝天开始
      let lanTianEndStr1 = '<br>买卖海鲜私聊群主  百万优惠';
      let lantian = `群内设置免打扰, 祝各位游戏愉快<br><br>已上线：${roomAnchor}<br>房间号：${roomId}<br>${lanTianEndStr1}`;
      // await sendToLanTian(lantian);
      // console.log(lantian)
      // 蓝天结束
  
      // await sleep(Math.floor(Math.random() * 500) + 1900); // 2000
  
      // ABC开始
      // let abcEndStr1 = '<br>买卖海鲜私聊群主';
      // let abc = `群内设置免打扰, 祝各位游戏愉快<br><br>已上线：${roomAnchor}<br>房间号：${roomId}<br>${abcEndStr1}`;
  
      if (!isSend[roomId]) {
        isSend[roomId] = true;
        setTimeout(function() {
          isSend[roomId] = false;
        }, 5 * 60 * 1000);
        
        let abcEndStr1 = '<br>进出海鲜私聊群主';
        let abc = `群内设置免打扰 <br><br>已上线：${roomAnchor.replace(/暴Tui团丶/g, '').replace(/吃瓜群众丶/g, '')}<br>房间号：${roomId}`;//<br>${abcEndStr1};
    
        // console.log("发送至abc手机");
        // await sendToABC(abc)

        console.log("发送至new abc手机");
        let newAbcData = {
          "action": 2,
          "roomInfo": `已上线：${roomAnchor}`,
          "title": `房间号：${roomId}`,
          "contentNum": "",
          "contentStar": ""
        }


        // todo
        await sendToABC(newAbcData) // 发送至abc

        // await sleep(1500);

        await sendToLanTian(newAbcData) // 发送到蓝天

        // await sleep(1500);

        await sendToWeiXiao(newAbcData); // 发送到微笑
        
        // await sleep(1500);

        await sendToGangBeng(newAbcData); // 发送到钢镚


        console.log("发送至微信");
        ipcRenderer.send('to-wx-msg', {
          user: "abc",
          msg: abc
        });
        console.log(abc)
      } else {
        console.log("重复发送")
      }

      // ABC结束
  
      sysSend = false;
    })
  
    // ipcRenderer.on('webview-go-offline', async (event, arg) => {
    ipcRenderer.on('go-offline', async (event, arg) => {
      console.log('删前')
      for(var [key, value] of dataCacheNw){
        console.log("属性：" + key + ", 值：" + value);
      }
      dataCacheNw.delete(+arg);
      console.log('删后')
      for(var [key, value] of dataCacheNw){
        console.log("属性：" + key + ", 值：" + value);
      }
      console.log(`${arg} offline`)
    })
  
  
    // 蓝天
    // async function sendToLanTian(lanTianStr) {
    //   // let groupName = '斗鱼竞猜交流';
    //   // let nodes = document.querySelectorAll('.chat_item .nickname_text');
    //   // for (let it of nodes) {
    //   //   if (it.innerHTML.indexOf(groupName) > -1) {
    //   //     it.click();
    //   //     break;
    //   //   }
    //   // }
    //   // await sleep(Math.floor(Math.random() * 500) + 1200); // 1500
  
    //   // const lanTianWebToMobileUrl = 'https://blmh.xyz:10236/hm/stm';
    //   const lanTianWebToMobileUrl = 'http://127.0.0.1:10236/hm/stm';
    //   Fetch(lanTianWebToMobileUrl, 'post', {con: lanTianStr.replace(/<br>/g, '\n')}).then(res => res.text())
    //   .then(res => {
    //     res=JSON.parse(res);
    //     if (res.code == '0000') {
    //       console.log('蓝天发送手机成功');
    //     } else {
    //       console.log('蓝天发送手机失败');
    //     }
    //   });
  
    //   // await sendDataWX(lanTianStr);
    // }
  
    async function sendToABC(abcStr) {
      // let groupName = '#include';  Math.floor(Math.random() * 500) + 1200
      // let lanTianGroupName = '斗鱼竞猜交流';
      // let groupName = '斗';
      // let groupName1 = '交流';
  
      // let groupName = 'ABC记录';
      // let nodes = document.querySelectorAll('.chat_item .nickname_text');
      // for (let it of nodes) {
      //   // if (it.innerHTML.indexOf(lanTianGroupName) == -1 && it.innerHTML.indexOf(groupName) > -1 && it.innerHTML.indexOf(groupName1) > -1) {
      //   if (it.innerHTML.indexOf(groupName) > -1) {
      //     it.click();
      //     break;
      //   }
      // }
      // await sleep(Math.floor(Math.random() * 500) + 1200); // 1500
  
      const abcWebToMobileUrl = 'http://127.0.0.1:10236/abc/stm_ws';
      // const abcWebToMobileUrl = 'https://blmh.xyz:10236/hm/stm';

      // Fetch(abcWebToMobileUrl, 'post', {con: abcStr.replace(/<br>/g, '\n')}).then(res => res.text())
      Fetch(abcWebToMobileUrl, 'post', abcStr).then(res => res.text())
      .then(res => {
        res=JSON.parse(res);
        if (res.code == '0000') {
          console.log('ABC发送客户端成功');
        } else {
          console.log('ABC发送客户端失败');
        }
      });
  
      // await sendDataWX(abcStr);
    }
  
      
    async function sendToLanTian(abcStr) {
      const abcWebToMobileUrl = 'http://127.0.0.1:10236/lantian/stm_ws';
      // const abcWebToMobileUrl = 'https://blmh.xyz:10236/hm/stm';

      // Fetch(abcWebToMobileUrl, 'post', {con: abcStr.replace(/<br>/g, '\n')}).then(res => res.text())
      Fetch(abcWebToMobileUrl, 'post', abcStr).then(res => res.text())
      .then(res => {
        res=JSON.parse(res);
        if (res.code == '0000') {
          console.log('lantian发送客户端成功');
        } else {
          console.log('lantian发送客户端失败');
        }
      });
  
      // await sendDataWX(abcStr);
    }
          
    async function sendToWeiXiao(weiXiaoStr) {
        const weiXiaoWebToMobileUrl = 'http://127.0.0.1:10236/weixiao/stm_ws';
        // const abcWebToMobileUrl = 'https://blmh.xyz:10236/hm/stm';
  
        // Fetch(abcWebToMobileUrl, 'post', {con: abcStr.replace(/<br>/g, '\n')}).then(res => res.text())
        Fetch(weiXiaoWebToMobileUrl, 'post', weiXiaoStr).then(res => res.text())
        .then(res => {
          res=JSON.parse(res);
          if (res.code == '0000') {
            console.log('weixiao发送客户端成功');
          } else {
            console.log('weixiao发送客户端失败');
          }
        });
    
        // await sendDataWX(abcStr);
      }

      async function sendToGangBeng(gbStr) {
        const abcWebToMobileUrl = 'http://127.0.0.1:10236/gangbeng/stm_ws';

        Fetch(abcWebToMobileUrl, 'post', gbStr).then(res => res.text())
        .then(res => {
          res=JSON.parse(res);
          if (res.code == '0000') {
            console.log('GangBeng发送客户端成功');
          } else {
            console.log('GangBeng发送客户端失败');
          }
        });
    
        // await sendDataWX(abcStr);
      }

    // async function sendDataWX(e) {
    //   if (document.querySelectorAll('.chat_item.active .nickname_text').length > 0) {
    //       if(document.getElementsByClassName('btn_send').length > 0) {
    //           var evt = document.createEvent('Event');
    //           evt.initEvent('input', true, true);
    //           document.getElementById('editArea').innerHTML = e;
    //           document.getElementById('editArea').dispatchEvent(evt);
    //           await sleep(Math.floor(Math.random() * 500) + 900); // 1000
    //           document.getElementsByClassName('btn_send')[0].click();
    //           console.log('发送');
    //       }
    //   }
    // }
  
    
    function setCache(dataCacheNwItem, titleItem, resultItem) {
      if (!dataCacheNwItem.has(titleItem)) {
        dataCacheNwItem.set(titleItem, []);
      }
      
      dataCacheNwItem.get(titleItem).push(resultItem)
    }
  
  });