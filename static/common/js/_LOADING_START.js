let _LOADING_START_CSS = document.createElement('style');
_LOADING_START_CSS.innerHTML = `#_LOADING{
    /* background-color: #db5800;*/
     background-color: #00000036;
     height: 100%;
     width: 100%;
     position: fixed;
     z-index: 100;
     margin-top: 0rem;
     top: 0rem;
     left: 0rem;
}
#_LOADING-CENTER{
    width: 100%;
    height: 100%;
    position: relative;
}
#_LOADING_CENTER_ABSOLUTE {
    position: absolute;
    left: 50%;
    top: 50%;
    height: 1.25rem;
    width: 6.25rem;
    margin-top: -0.625rem;
    margin-left: -3.125rem;
}
._LOADING:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    animation: ellipsis 1.5s infinite;
    content: "...";
}
@keyframes ellipsis {
    from {
        width: 0.125rem;
    }
    to {
        width: 0.9375rem;
    }
}
#_LOADING-CENTER-tips {
    position: absolute;
    left: 50%;
    top: 50%;
    height: 1.25rem;
    width: 6.25rem;
    margin-top: 0.9375rem;
    margin-left: -2.0625rem;
    font-size: 1rem;
    /* margin-top: -10px; */
    /* margin-left: -50px; */

}
._OBJECT{
    width: 1.25rem;
    height: 1.25rem;
    background-color: #db5800;
    -moz-border-radius: 50% 50% 50% 50%;
    -webkit-border-radius: 50% 50% 50% 50%;
    border-radius: 50% 50% 50% 50%;
    margin-right: 1.25rem;
    margin-bottom: 1.25rem;
    position: absolute;    
}
#_OBJECT_ONE{
    -webkit-animation: _OBJECT 2s linear infinite;
     animation: _OBJECT 2s linear infinite;
}
#_OBJECT_TWO{ 
    -webkit-animation: _OBJECT 2s linear infinite -.4s;
    animation: _OBJECT 2s linear infinite -.4s;
}
#_OBJECT_THREE{ 
    -webkit-animation: _OBJECT 2s linear infinite -.8s; 
    animation: _OBJECT 2s linear infinite -.8s; 
}
#_OBJECT_FOUR{ 
    -webkit-animation: _OBJECT 2s linear infinite -1.2s;
    animation: _OBJECT 2s linear infinite -1.2s; 
}
#_OBJECT_FIVE{ 
    -webkit-animation: _OBJECT 2s linear infinite -1.6s; 
    animation: _OBJECT 2s linear infinite -1.6s; 
}
@-webkit-keyframes _OBJECT{
  0% { left: 6.25rem; top:0}
  80% { left: 0; top:0;}
  85% { left: 0; top: -1.25rem ; width: 1.25rem; height: 1.25rem;}
  90% { width: 2.5rem; height: 0.9375rem; }
  95% { left: 6.25rem; top: -1.25rem ; width: 1.25rem; height: 1.25rem;}
  100% { left: 6.25rem; top:0; }
}
@keyframes _OBJECT{
  0% { left: 6.25rem; top:0}
  80% { left: 0; top:0;}
  85% { left: 0; top: -1.25rem ; width: 1.25rem; height: 1.25rem;}
  90% { width: 2.5rem; height: 0.9375rem; }
  95% { left: 6.25rem; top: -1.25rem; width: 1.25rem; height: 1.25rem;}
  100% { left: 6.25rem; top:0; }
}

@media only screen and (min-width: 216pt){
    html {
        font-size: 35px !important; 
    }
}
@media only screen and (min-width: 810pt){
    html {
        font-size: 16px !important; 
    }
}`;
document.head.appendChild(_LOADING_START_CSS);


let _LOADING_START_HTML = document.createElement('div');

_LOADING_START_HTML.innerHTML = `<div id="_LOADING">
<div id="_LOADING-CENTER">
    <div id="_LOADING_CENTER_ABSOLUTE">
        <div class="_OBJECT" id="_OBJECT_ONE"></div>
        <div class="_OBJECT" id="_OBJECT_TWO" style="left:1.25rem;"></div>
        <div class="_OBJECT" id="_OBJECT_THREE" style="left:2.5rem;"></div>
        <div class="_OBJECT" id="_OBJECT_FOUR" style="left:3.75rem;"></div>
        <div class="_OBJECT" id="_OBJECT_FIVE" style="left:5rem;"></div>
    </div>
    <span class="_LOADING" id="_LOADING-CENTER-tips">玩命加载中</span>
</div>
</div>`;


// document.body.prepend(_LOADING_START_HTML)






