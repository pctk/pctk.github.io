(function(){
    /*
        * Add integers, wrapping at 2^32. This uses 16-bit operations internally
        * to work around bugs in some JS interpreters.
        */
    function safeAdd (x, y) {
        var lsw = (x & 0xffff) + (y & 0xffff)
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
        return (msw << 16) | (lsw & 0xffff)
    }

    /*
    * Bitwise rotate a 32-bit number to the left.
    */
    function bitRotateLeft (num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt))
    }

    /*
    * These functions implement the four basic operations the algorithm uses.
    */
    function md5cmn (q, a, b, x, s, t) {
        return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
    }
    function md5ff (a, b, c, d, x, s, t) {
        return md5cmn((b & c) | (~b & d), a, b, x, s, t)
    }
    function md5gg (a, b, c, d, x, s, t) {
        return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
    }
    function md5hh (a, b, c, d, x, s, t) {
        return md5cmn(b ^ c ^ d, a, b, x, s, t)
    }
    function md5ii (a, b, c, d, x, s, t) {
        return md5cmn(c ^ (b | ~d), a, b, x, s, t)
    }

    /*
    * Calculate the MD5 of an array of little-endian words, and a bit length.
    */
    function binlMD5 (x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32)
        x[((len + 64) >>> 9 << 4) + 14] = len

        var i
        var olda
        var oldb
        var oldc
        var oldd
        var a = 1732584193
        var b = -271733879
        var c = -1732584194
        var d = 271733878

        for (i = 0; i < x.length; i += 16) {
        olda = a
        oldb = b
        oldc = c
        oldd = d

        a = md5ff(a, b, c, d, x[i], 7, -680876936)
        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586)
        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819)
        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330)
        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897)
        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426)
        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341)
        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983)
        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416)
        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417)
        c = md5ff(c, d, a, b, x[i + 10], 17, -42063)
        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162)
        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682)
        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101)
        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290)
        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329)

        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510)
        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632)
        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713)
        b = md5gg(b, c, d, a, x[i], 20, -373897302)
        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691)
        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083)
        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335)
        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848)
        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438)
        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690)
        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961)
        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501)
        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467)
        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784)
        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473)
        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734)

        a = md5hh(a, b, c, d, x[i + 5], 4, -378558)
        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463)
        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562)
        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556)
        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060)
        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353)
        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632)
        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640)
        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174)
        d = md5hh(d, a, b, c, x[i], 11, -358537222)
        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979)
        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189)
        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487)
        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835)
        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520)
        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651)

        a = md5ii(a, b, c, d, x[i], 6, -198630844)
        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415)
        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905)
        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055)
        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571)
        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606)
        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523)
        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799)
        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359)
        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744)
        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380)
        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649)
        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070)
        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379)
        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259)
        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551)

        a = safeAdd(a, olda)
        b = safeAdd(b, oldb)
        c = safeAdd(c, oldc)
        d = safeAdd(d, oldd)
        }
        return [a, b, c, d]
    }

    /*
    * Convert an array of little-endian words to a string
    */
    function binl2rstr (input) {
        var i
        var output = ''
        var length32 = input.length * 32
        for (i = 0; i < length32; i += 8) {
        output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff)
        }
        return output
    }

    /*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    function rstr2binl (input) {
        var i
        var output = []
        output[(input.length >> 2) - 1] = undefined
        for (i = 0; i < output.length; i += 1) {
        output[i] = 0
        }
        var length8 = input.length * 8
        for (i = 0; i < length8; i += 8) {
        output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32)
        }
        return output
    }

    /*
    * Calculate the MD5 of a raw string
    */
    function rstrMD5 (s) {
        return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
    }

    /*
    * Calculate the HMAC-MD5, of a key and some data (raw strings)
    */
    function rstrHMACMD5 (key, data) {
        var i
        var bkey = rstr2binl(key)
        var ipad = []
        var opad = []
        var hash
        ipad[15] = opad[15] = undefined
        if (bkey.length > 16) {
        bkey = binlMD5(bkey, key.length * 8)
        }
        for (i = 0; i < 16; i += 1) {
        ipad[i] = bkey[i] ^ 0x36363636
        opad[i] = bkey[i] ^ 0x5c5c5c5c
        }
        hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8)
        return binl2rstr(binlMD5(opad.concat(hash), 512 + 128))
    }

    /*
    * Convert a raw string to a hex string
    */
    function rstr2hex (input) {
        var hexTab = '0123456789abcdef'
        var output = ''
        var x
        var i
        for (i = 0; i < input.length; i += 1) {
        x = input.charCodeAt(i)
        output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f)
        }
        return output
    }

    /*
    * Encode a string as utf-8
    */
    function str2rstrUTF8 (input) {
        return unescape(encodeURIComponent(input))
    }

    /*
    * Take string arguments and return either raw or hex encoded strings
    */
    function rawMD5 (s) {
        return rstrMD5(str2rstrUTF8(s))
    }
    function hexMD5 (s) {
        return rstr2hex(rawMD5(s))
    }
    function rawHMACMD5 (k, d) {
        return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
    }
    function hexHMACMD5 (k, d) {
        return rstr2hex(rawHMACMD5(k, d))
    }

    function md5 (string, key, raw) {
        if (!key) {
        if (!raw) {
            return hexMD5(string)
        }
        return rawMD5(string)
        }
        if (!raw) {
        return hexHMACMD5(key, string)
        }
        return rawHMACMD5(key, string)
    }

    function S4() { 
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
    }; 
    // Generate a pseudo-GUID by concatenating random hexadecimal. 
    function guid() { 
        return (S4()+S4()+""+S4()+""+S4()+""+S4()+""+S4()+S4()+S4()); 
    }; 

    function getUnixTimestamp() {
        return Math.round(new Date().getTime() / 1000);
    }
    function concat() {
        for (var e = arguments.length, t = Array(e), r = 0; r < e; r++)
            t[r] = arguments[r];
        return t.reduce(function(e, t) {
            e instanceof ArrayBuffer && (e = new Uint8Array(e)),
            t instanceof ArrayBuffer && (t = new Uint8Array(t));
            var r = new Uint8Array(e.length + t.length);
            return r.set(e, 0),
            r.set(t, e.length),
            r
        })
    }
    
    function encode(e) {
        var t = true
        , r = new TextEncoder
        , n = (0,
      concat)(r.encode(e), [0])
        , o = 8 + n.byteLength
        , i = new DataView(new ArrayBuffer(o + 4))
        , a = 0;
      return i.setUint32(a, o, t),
      a += 4,
      i.setUint32(a, o, t),
      a += 4,
      i.setInt16(a, 689, t),
      a += 2,
      i.setInt8(a, 0),
      a += 1,
      i.setInt8(a, 0),
      a += 1,
      new Uint8Array(i.buffer).set(n, a),
      i.buffer
    }
    
    function decode(e, port, t) {
        var r = true
            , n = new TextDecoder
            , o = concat;
        for (this.buffer ? this.buffer = o(this.buffer, e).buffer : this.buffer = e; this.buffer && this.buffer.byteLength > 0; ) {
            var i = new DataView(this.buffer);
            if (0 === this.readLength) {
                if (this.buffer.byteLength < 4)
                    return;
                this.readLength = i.getUint32(0, r),
                this.buffer = this.buffer.slice(4)
            }
            if (this.buffer.byteLength < this.readLength)
                return;
            var a = n.decode(this.buffer.slice(8, this.readLength - 1));
            // kunRequestCache.handlerData(a, port);
            handlerData(a, port);
            this.buffer = this.buffer.slice(this.readLength),
            this.readLength = 0,
            t(a)
        }
    }
    function directDecode(e, port,  t) {
        decode(e.data, port, t);
    }


    function sendMessage(socket, e) {
        socket.send(encode(e));
    }

    function connectDanMu(port) {
        let danmuWebSocket = new WebSocket('wss://danmuproxy.douyu.com:' + port);
        danmuWebSocket.binaryType = "arraybuffer";
        danmuWebSocket.onopen = function () {
            let now = getUnixTimestamp(),
            devid = guid(),
            vk = md5(now + "r5*^5;}2#${XF[h+;'./.Q'1;,-]f'p[" + DevicesId);
            sendMessage(danmuWebSocket, `type@=loginreq/roomid@=${roomId}/dfl@=sn@AA=106@ASss@AA=1@Ssn@AA=107@ASss@AA=1@Ssn@AA=108@ASss@AA=1@Ssn@AA=105@ASss@AA=1@Ssn@AA=110@ASss@AA=1/username@=/password@=/ltkid@=/biz@=/stk@=/devid@=${devid}/ct@=0/pt@=2/rt@=${now}/vk@=${vk}/ver@=20190328/aver@=218101901/dmbt@=chrome/dmbv@=69/`);
            
            // sendMessage(danmuWebSocket, `type@=loginreq/roomid@=${roomId}/dfl@=/username@=${UserName}/uid@=${UId}/ver@=20190328/aver@=218101901/ct@=0/`);
            sendMessage(danmuWebSocket, 'type@=mrkl/');
            
            if(heartCheck.has(port)) {
                window.clearInterval(heartCheck.get(port));
            }
            heartCheck.set(port, setInterval(function() {
                sendMessage(danmuWebSocket, 'type@=mrkl/');
            }, 25000))
        };
            
        danmuWebSocket.onclose = function (e) {
            console.log(`port: ${port} dm close`);
            connectDanMu(port);
        };
        
        danmuWebSocket.onerror = function(e){
            console.log('error');
        };
        
        danmuWebSocket.onmessage = function (e) {
            directDecode(e, port, function(a) {
                // if (a.indexOf('type@=rquizisn') > -1) {
                if (a.indexOf('type@=rquiziln') > -1) {
                    // console.log(`-------danmu----${port}---` + a);
                    let leftOdds = a.match(/folpc@AA=[\d]+/)[0].split('@AA=')[1];
                } else if (a.indexOf('type@=loginres') > -1) {
                    sendMessage(danmuWebSocket, `type@=joingroup/rid@=${roomId}/gid@=0/`);
                }
            })
        }
    }

    
    function connectWS(port) {
        let webSocket = new WebSocket(`wss://wsproxy.douyu.com:${port}`);
        webSocket.binaryType = "arraybuffer";
        webSocket.onopen = function () {
            let now = getUnixTimestamp(),
            devid = guid(),
            vk = md5(now + "r5*^5;}2#${XF[h+;'./.Q'1;,-]f'p[" + devid);
            sendMessage(webSocket, `type@=loginreq/roomid@=${roomId}/dfl@=sn@AA=106@ASss@AA=1@Ssn@AA=107@ASss@AA=1@Ssn@AA=108@ASss@AA=1@Ssn@AA=105@ASss@AA=1@Ssn@AA=110@ASss@AA=1/username@=/password@=/ltkid@=/biz@=/stk@=/devid@=${devid}/ct@=0/pt@=2/rt@=${now}/vk@=${vk}/ver@=20190328/aver@=218101901/dmbt@=chrome/dmbv@=69/`);


            // let now = getUnixTimestamp(),
            // vk = md5(now + "r5*^5;}2#${XF[h+;'./.Q'1;,-]f'p[" + DevicesId);
            // sendMessage(webSocket, `type@=loginreq/roomid@=${roomId}/dfl@=/username@=${UserName}/password@=/ltkid@=${ltkid}/biz@=1/stk@=${acfStk}/devid@=${DevicesId}/ct@=0/pt@=2/rt@=${now}/vk@=${vk}/ver@=20190328/aver@=218101901/dmbt@=chrome/dmbv@=69/`);
            sendMessage(webSocket, `type@=keeplive/vbw@=0/cdn@=/tick@=${getUnixTimestamp()}/kd@=/`);
    
            setInterval(function() {
                sendMessage(webSocket, `type@=keeplive/vbw@=0/cdn@=/tick@=${getUnixTimestamp()}/kd@=/`);
            }, 25000);
        };
    
        webSocket.onclose = function (e) {
            console.log('ws close');
        };
    
        webSocket.onerror = function(e){
            console.log('ws error');
        };
    
        webSocket.onmessage = function (e) {
            directDecode(e, port, function(a) {
                if (a.indexOf('type@=rquizisn') > -1 || a.indexOf('type@=rquiziln') > -1 || a.indexOf('type@=quizprn') > -1) {
                    console.log(`-------ws----${port}---` + a);
                }
            });
        }
    }
    function getCookie(name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
        else
        return null;
    }
    let roomId = $ROOM.room_id;
    
    let DevicesId = getCookie('dy_did'),
    UserName = getCookie('acf_username'),
    UId = getCookie('acf_uid'),
    ltkid = getCookie('acf_ltkid'),
    acfStk = getCookie('acf_stk');
    let danMuPorts = ['8501', '8502', '8503', '8504', '8505', '8506'];
    // let danMuPorts = ['8501'];
    let heartCheck = new Map()
    // let wsPorts = ['6671', '6672', '6673', '6674', '6675', '6676'];
    let wsPorts = ['6671'];
    for(let port of wsPorts) {
        connectWS(port);
    }
    for(let port of danMuPorts) {
        connectDanMu(port);
    }

    const ipc = require('electron').ipcRenderer;
    // let roomId = false;
    // function getRoomId(t, n) {
    //     try {
    //         roomId = $ROOM.room_id
    //         n();

    //         for(let port of ports) {
    //             t(port);
    //         }
    //     } catch (err) {
    //     }
    // }
    // getRoomId(connectDanMu, connectWS);

    let ctn = getCookie('acf_ccn');
    let cacheWorkData = {};
    let cachePendingData = new Map();
    let usedBankerId = [];
    let DanMuLock = true, WSLock = true;
    let qIdAndTitle = new Map();

    function handlerData(e, port) {
        // console.log(e);
        if (e.indexOf('type@=rquizisn') > -1) {
            if (WSLock) {
                // WSLock = false;

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
                        cachePendingData.delete('' + quizId + 0)
                        cachePendingData.delete('' + quizId + 1)
                        guessState[quizId] = false;
                        cacheWorkData[quizId] = {
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
                            lrWork(title, titleInfo[title].get('leftTitle'), 0, quizId, fbid,  fbmc, leftOdds, port);
                        }

                        if (+sbid > 0) {
                            lrWork(title, titleInfo[title].get('rightTitle'), 1, quizId, sbid, sbmc, rightOdds, port);
                        }
                    }

                    ipc.send('to-main-message', pageData);
                }
                // WSLock = true;
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
        } else if (e.indexOf('type@=rquiziln') > -1) {
            if (DanMuLock) {
                DanMuLock = false;
                console.log(`-------danmu----${port}---` + e);

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

                            function foo(dddata, valueT) { //父级函数
                                setTimeout(() => {
                                    Fetch("https://www.douyu.com/member/quiz/become_banker", 'post', dddata).then(res => res.text())
                                    .then(res => {
                                        res=JSON.parse(res) ;
                                        if (res.error == 0) {
                                            let contentStr = `${title}->${1 === valueT.option ? leftTitle : rightTitle}->开猜->赔率:${+valueT.minOdds / 100} / 鱼丸:${valueT.amount}`;
                                            ipc.send('to-main-log', contentStr);
                                        }
                                    }).catch((error) => {  
                                    });
                                }, valueT.delay);
                            }
                            
                            if (value.delay > 0) {
                                foo(postData, value);
                            } else {
                                Fetch("https://www.douyu.com/member/quiz/become_banker", 'post', postData).then(res => res.text())
                                .then(res => {
                                    res=JSON.parse(res) ;
                                    if (res.error == 0) {
                                        let contentStr = `${title}->${1 === value.option ? leftTitle : rightTitle}->开猜->赔率:${+value.minOdds / 100} / 鱼丸:${value.amount}`;
                                        ipc.send('to-main-log', contentStr);
                                    }
                                }).catch((error) => {
                                });
                            }
                            

                            kcCatchData[title].delete(value.option);
                        }
                    }
                }
                DanMuLock = true;
            }
        } 
        
    }

    
    // const ipc = require('electron').ipcRenderer
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
                changeListen(quizId, leftOrRight, isListen, minOdds, minAmount, isMP);
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
                let cachePendingData = getCachePendingData(key);
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
                            setUsedBankerId(+value.get('banker_id'));
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
                    removeCachePendingData(key);
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
    });

    /**
    * 
    * @param {*} dataIndex 第几个盘口
    * @param {*} leftOrRight 0 is left, 1 is right
    * @param {*} isListen  true监听  false取消监听
    * @param {*} minOdds 最小赔率
    * @param {*} minAmount 最小金额
    */
    function changeListen(quizId, leftOrRight, isListen, minOdds, minAmount, isMP) {
        if (!cacheWorkData[quizId]) {
            cacheWorkData[quizId] = {
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
        let cc = cacheWorkData[quizId];
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
    function removeListen() {
        if (cacheWorkData.length > 0) {
            for (let i = 0, len = cacheWorkData.length; i < len; i++) {
                cacheWorkData[i] = {
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

    function getCachePendingData(key) {
        // return cachePendingData[key] ? cachePendingData[key] : false;
        return cachePendingData.has(key) ? cachePendingData.get(key) : false;
    }

    function setUsedBankerId(bankerId) {
        usedBankerId.push(bankerId);
    }

    function removeCachePendingData(key) {
        // cachePendingData[quizId].delete(mapKey)
        cachePendingData.delete(key);
        console.log(cachePendingData)
    }

    function lrWork(title, lrTitle, leftOrRight, quizId, bankerId, balance, odds, port) {
        let bankerIdIndex = usedBankerId.indexOf(+bankerId);
        if (bankerIdIndex > -1) {
            return;
        }

        if (!cacheWorkData[quizId]) {
            cacheWorkData[quizId] = {
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
        let cc = cacheWorkData[quizId];
        let minOdds = 0 === leftOrRight ? cc.leftMinOdds : cc.rightMinOdds,
        minAmount = 0 === leftOrRight ? cc.leftMinAmount : cc.rightMinAmount,
        isListen = 0 === leftOrRight ? cc.left: cc.right,
        isMP = 0 === leftOrRight ? cc.leftIsMP : cc.rightIsMP;            

        let catchContent = new URLSearchParams()
        catchContent.set('ctn', ctn)
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
                cacheWorkData[quizId] = {
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
            if (!cachePendingData.has(key)) {
                cachePendingData.set(key, []);
            }

            let cPendignData = cachePendingData.get(key);
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

})();