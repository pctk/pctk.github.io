
$('body').html(`<div style="">
<div class="prism-player" id="player-con"></div>
<div class="current-time"></div>
<div class="end-time"></div>

<div class="buts">

<span class="speed">1</span>
<br>
<!-- <input class="num"></input> -->
<button class="add">快速+</button>
<button class="reduce">快速-</button>
<br>
<button class="add-slow">慢速+</button>
<button class="reduce-slow">慢速-</button>
<button class="pause">暂停</button>
<button class="goon">继续</button>

<button class="jump">tiao-</button>
</div>
</div>`)

let url = document.location.toString();
let arrUrl = url.split("#")[1];
var player = new Aliplayer({
"id": "player-con",
"source": arrUrl,
"width": "1440px",
"height": "810px",
"autoplay": true,
"isLive": true,
"rePlay": false,
"playsinline": false,
"preload": false,
"loadDataTimeout": "0",
"enableStashBufferForFlv": false,
"stashInitialSizeForFlv": "0",
"controlBarVisibility": "hover",
"useH5Prism": true
}, function (player) {
// player._switchLevel = 0;
player.setVolume(0.04)
console.log("播放器创建了。");
//     window.setInterval(function() {
//         player.seek(player.getBuffered().end(0) - 1);
//         console.log(player.getBuffered().end(0))
// //         player.setCurrentTime(player.getBuffered().end(0))

// // console.log(document.getElementsByTagName('video').currentTime)
// //         document.getElementsByTagName('video').currentTime = player.getBuffered().end(0);
// //         player.currentTime = player.getBuffered().end(1);
//     }, 100);
}
);

let autoEnd = false;
$(document).on('click', '.pause', function(ev) {
isDoTime = false;
 player.pause();
 autoEnd = window.setInterval(function(){
    player.toEnd();
    $('.end-time').html(player.getBuffered().end(0) - player.getCurrentTime());
 }, 150);
});

$(document).on('click', '.goon', function(ev) {
 if (autoEnd) {
    isDoTime = true;
    player.play();
    window.clearInterval(autoEnd);
    autoEnd = false;
 }
});



$(document).on('click', '.jump', function(ev) {
console.log(player.getBuffered().end(0))
 player.toEnd();
// player.seek(player.getBuffered().end(0) - 0.1);
});




let speed = 1;

$(document).on('click', '.add-slow', function(ev) {
let bum = $('.num').val()
speed += 0.1;
$('.speed').html(speed)
player.setSpeed(speed)
});
$(document).on('click', '.reduce-slow', function(ev) {
let bum = $('.num').val()
speed -= 0.1;
$('.speed').html(speed)
player.setSpeed(speed)
});

$(document).on('click', '.add', function(ev) {
let bum = $('.num').val()
speed += 0.5;
$('.speed').html(speed)
player.setSpeed(speed)
});
$(document).on('click', '.reduce', function(ev) {
let bum = $('.num').val()
speed -= 0.5;
$('.speed').html(speed)
player.setSpeed(speed)
});


let isDoTime = true;
setInterval(function() {
$('.current-time').html(player.getCurrentTime());
if (isDoTime) {
    $('.end-time').html(player.getBuffered().end(0) - player.getCurrentTime());
}
}, 1000);
