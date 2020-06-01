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
    function getCookie(name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
        else
        return null;
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
            kunRequestCache.handlerData(a, port);
            this.buffer = this.buffer.slice(this.readLength),
            this.readLength = 0,
            t(a)
        }
    }
    function directDecode(e, port,  t) {
        decode(e.data, port, t);
    }


    function sendMessage(socket, e) {
        // console.log(e);
        socket.send(encode(e));
    }

    let DevicesId = getCookie('dy_did'),
    UserName = getCookie('acf_username'),
    UId = getCookie('acf_uid'),
    ltkid = getCookie('acf_ltkid'),
    acfStk = getCookie('acf_stk');
    let ports = ['8501', '8502', '8503', '8504', '8505', '8506'];
    // let ports = ['8501'];
    // let danmuSockets = [];
    // let synchronization = true;
    let heartCheck = new Map()
    const ipc = require('electron').ipcRenderer;

    function connectSocket(port) {
        let danmuWebSocket = new WebSocket('wss://danmuproxy.douyu.com:' + port);
        danmuWebSocket.binaryType = "arraybuffer";
        danmuWebSocket.onopen = function () {
            let now = getUnixTimestamp(),
            devid = guid(),
            vk = md5(now + "r5*^5;}2#${XF[h+;'./.Q'1;,-]f'p[" + DevicesId);
        
            console.log('now-' + md5(now + "r5*^5;}2#${XF[h+;'./.Q'1;,-]f'p[" + devid));
            console.log('devid-' + devid)
            console.log('danmu-' + vk);
            // ipc.send('to-main-log', `${roomId}——connect success`);
            // sendMessage(danmuWebSocket, `type@=loginreq/roomid@=${roomId}/dfl@=sn@AA=106@ASss@AA=1@Ssn@AA=107@ASss@AA=1@Ssn@AA=108@ASss@AA=1@Ssn@AA=105@ASss@AA=1@Ssn@AA=110@ASss@AA=1/username@=/password@=/ltkid@=/biz@=/stk@=/devid@=${devid}/ct@=0/pt@=2/rt@=${now}/vk@=${vk}/ver@=20190328/aver@=218101901/dmbt@=chrome/dmbv@=69/`);
            
            // sendMessage(danmuWebSocket, `type@=loginreq/roomid@=${roomId}/dfl@=sn@AA=106@ASss@AA=1@Ssn@AA=107@ASss@AA=1@Ssn@AA=108@ASss@AA=1@Ssn@AA=105@ASss@AA=1@Ssn@AA=110@ASss@AA=1/username@=${UserName}/password@=/ltkid@=/biz@=/stk@=/devid@=${DevicesId}/ct@=0/pt@=2/rt@=${now}/vk@=${vk}/ver@=20190328/aver@=218101901/dmbt@=chrome/dmbv@=69/`);
            // sendMessage(danmuWebSocket, `type@=keeplive/vbw@=0/cdn@=/tick@=${getUnixTimestamp()}/kd@=/`);
        
            sendMessage(danmuWebSocket, `type@=loginreq/roomid@=${roomId}/dfl@=/username@=${UserName}/uid@=${UId}/ver@=20190328/aver@=218101901/ct@=0/`);
            sendMessage(danmuWebSocket, 'type@=mrkl/');
            
            if(heartCheck.has(port)) {
                window.clearInterval(heartCheck.get(port));
            }
            heartCheck.set(port, setInterval(function() {
                // console.log(`port: ${port} hart`);
                sendMessage(danmuWebSocket, 'type@=mrkl/');
            }, 25000))
        };
            
        danmuWebSocket.onclose = function (e) {
            console.log(`port: ${port} dm close`);
            connectSocket(port);
        };
        
        danmuWebSocket.onerror = function(e){
            console.log('error');
        };
        
        danmuWebSocket.onmessage = function (e) {
            directDecode(e, port, function(a) {
                if (a.indexOf('type@=rquiziln') > -1 || (a.indexOf('type@=rquizisn') > -1 && a.indexOf('qs@AA=3') > -1) || a.indexOf('type@=quizprn') > -1) {
                    console.log('--dm-' + a);
                }
                if (a.indexOf('type@=rquizisn') > -1) {
                    let leftOdds = a.match(/folpc@AA=[\d]+/)[0].split('@AA=')[1];

                    // console.log(roomId + '--down-' + leftOdds + '---------' + (new Date()).getTime());
                    // console.log(roomId + '--正常');
                    // ipc.send('to-main-log', `${roomId}——normal`);
                } else if (a.indexOf('type@=loginres') > -1) {
                    sendMessage(danmuWebSocket, `type@=joingroup/rid@=${roomId}/gid@=1/`); //gid@=-9999    海量模式
                }
            })
        }

    }

    console.log($ROOM.room_id)
    let roomId = false;
    // const ipc = require('electron').ipcRenderer;
    function getRoomId(t, n) {
        try {
            // let roomIdUrl = document.querySelector('.Title-anchorName').getAttribute('href');
            // roomId = roomIdUrl.match(/room_id=[\d]+/)[0].split('=')[1];
            roomId = $ROOM.room_id
            n();

            for(let port of ports) {
                t(port);
            }
        } catch (err) {
        }
    }
    getRoomId(connectSocket, connectLn);



    function connectLn() {
        let webSocket = new WebSocket('wss://wsproxy.douyu.com:6673');
        webSocket.binaryType = "arraybuffer";
        webSocket.onopen = function () {
            let now = getUnixTimestamp(),
            // devid = guid(),
            vk = md5(now + "r5*^5;}2#${XF[h+;'./.Q'1;,-]f'p[" + DevicesId);
            // sendMessage(webSocket, `type@=loginreq/roomid@=${roomId}/dfl@=sn@AA=106@ASss@AA=1@Ssn@AA=107@ASss@AA=1@Ssn@AA=108@ASss@AA=1@Ssn@AA=105@ASss@AA=1@Ssn@AA=110@ASss@AA=1/username@=${UserName}/password@=/ltkid@=/biz@=/stk@=/devid@=${DevicesId}/ct@=0/pt@=2/rt@=${now}/vk@=${vk}/ver@=20190328/aver@=218101901/dmbt@=chrome/dmbv@=69/`);


            // type@=loginreq/roomid@=3733860/dfl@=/username@=194147237/password@=/ltkid@=64541581/biz@=1/stk@=bacc72e45164d993/devid@=c572bd7649f9b8c00b2ad23c00061501/ct@=0/pt@=2/rt@=1558272975/vk@=d81947875d816816718e95a4ee07f104/ver@=20190328/aver@=218101901/dmbt@=chrome/dmbv@=69/
            // type@=loginreq/roomid@=6074675/dfl@=/username@=194147237/password@=/ltkid@=64541578/biz@=1/stk@=ecc6590bbefc2af9/devid@=c572bd7649f9b8c00b2ad23c00061501/ct@=0/pt@=2/rt@=1558272878/vk@=ebe77295c663ccc5d494a72ea5d59999/ver@=20190328/aver@=218101901/dmbt@=chrome/dmbv@=69/
            
            sendMessage(webSocket, `type@=loginreq/roomid@=${roomId}/dfl@=/username@=${UserName}/password@=/ltkid@=${ltkid}/biz@=1/stk@=${acfStk}/devid@=${DevicesId}/ct@=0/pt@=2/rt@=${now}/vk@=${vk}/ver@=20190328/aver@=218101901/dmbt@=chrome/dmbv@=69/`);
            // sendMessage(webSocket, `type@=loginreq/roomid@=${roomId}/dfl@=sn@AA=106@ASss@AA=1@Ssn@AA=107@ASss@AA=1@Ssn@AA=108@ASss@AA=1@Ssn@AA=105@ASss@AA=1@Ssn@AA=110@ASss@AA=1/username@=${UserName}/password@=/ltkid@=/biz@=/stk@=/devid@=${DevicesId}/ct@=0/pt@=2/rt@=${now}/vk@=${vk}/ver@=20190328/aver@=218101901/dmbt@=chrome/dmbv@=69/`);
            sendMessage(webSocket, `type@=keeplive/vbw@=0/cdn@=/tick@=${getUnixTimestamp()}/kd@=/`);
    
            setInterval(function() {
                sendMessage(webSocket, `type@=keeplive/vbw@=0/cdn@=/tick@=${getUnixTimestamp()}/kd@=/`);
            }, 25000);
        };
    
        webSocket.onclose = function (e) {
            console.log('ws close');
            // connectLn(roomId) 
        };
    
        webSocket.onerror = function(e){
            console.log('ws error');
        };
    
        webSocket.onmessage = function (e) {
            directDecode(e, '8501', function(a) {
                if (a.indexOf('type@=rquizisn') > -1 || a.indexOf('type@=rquiziln') > -1 || a.indexOf('type@=quizprn') > -1) {
                    console.log('--ws-' + a);
                }
            });
        }
    }




    // console.log(roomId);

    // ipc.on('nw-message', (event, arg) => {
    //     if('xzWork' === arg.action) {
    //     }
    // });
    // for (let port of ports) {
    //     let danmuWebSocket = new WebSocket('wss://danmuproxy.douyu1.com:' + port);
    //     danmuWebSocket.binaryType = "arraybuffer";
    //     danmuWebSocket.onopen = function () {
    //         let now = getUnixTimestamp(),
    //         // devid = getCookie('dy_did'),
    //         // devid = '5c4f14ef31904d9e844592f4b01a1b99',
    //         devid = guid(),
    //         // vk = mmmmd5()(now + "r5*^5;}2#${XF[h+;'./.Q'1;,-]f'p[" + devid).toString();
    //         vk = md5(now + "r5*^5;}2#${XF[h+;'./.Q'1;,-]f'p[" + devid);
        
    //         console.log('now-' + md5(now + "r5*^5;}2#${XF[h+;'./.Q'1;,-]f'p[" + devid));
    //         console.log('devid-' + devid)
    //         console.log('danmu-' + vk)
    //         sendMessage(danmuWebSocket, `type@=loginreq/roomid@=5856036/dfl@=sn@AA=106@ASss@AA=1@Ssn@AA=107@ASss@AA=1@Ssn@AA=108@ASss@AA=1@Ssn@AA=105@ASss@AA=1@Ssn@AA=110@ASss@AA=1/username@=/password@=/ltkid@=/biz@=/stk@=/devid@=${devid}/ct@=0/pt@=2/rt@=${now}/vk@=${vk}/ver@=20190328/aver@=218101901/dmbt@=chrome/dmbv@=69/`);
    //         sendMessage(danmuWebSocket, `type@=keeplive/vbw@=0/cdn@=/tick@=${getUnixTimestamp()}/kd@=/`);
        
    //         if(heartCheck) {
    //             window.clearInterval(heartCheck);
    //         }
    //         heartCheck = setInterval(function() {
    //             sendMessage(danmuWebSocket, 'type@=mrkl/');
    //         }, 30000);
    //         // sendMessage(`type@=loginreq/roomid@=5856036/dfl@=sn@AA=106@ASss@AA=1@Ssn@AA=107@ASss@AA=1@Ssn@AA=108@ASss@AA=1@Ssn@AA=105@ASss@AA=1@Ssn@AA=110@ASss@AA=1/username@=visitor883834/password@=1234567890123456/ver@=20190328/aver@=218101901/ct@=0/`)
    //         // sendMessage('type@=joingroup/rid@=5856036/gid@=-9999/')
    //     };
            
    //     danmuWebSocket.onclose = function (e) {
    //         console.log('close');
    //     };
        
    //     danmuWebSocket.onerror = function(e){
    //         console.log('error');
    //     };
        
    //     danmuWebSocket.onmessage = function (e) {
    //         // console.log(e.data);
    //         directDecode(e, function(a) {
    //             // console.log(port + '--down-' + a);
    //             if (a.indexOf('type@=rquizisn') > -1) {
    //                 let leftOdds = a.match(/folpc@AA=[\d]+/)[0].split('@AA=')[1];

    //                 console.log(port + '--down-' + leftOdds + '---------' + (new Date()).getTime());
    //             } else if (a.indexOf('type@=loginres') > -1) {
    //                 // sendMessage(danmuWebSocket, 'type@=joingroup/rid@=5856036/gid@=-9999/');
    //                 sendMessage(danmuWebSocket, 'type@=joingroup/rid@=5856036/gid@=1/');
    //             }
    //         })
    //     }
    //     danmuSockets.push(danmuWebSocket);

    // }




})();