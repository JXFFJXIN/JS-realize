// 配置变量
var config = {

    imgWidth: 520, //规定每个图片的宽度
    dotWidth: 12, //规定每个控制组件容器的长度
    doms: {
        //将html的dom进行提取
        divBanner: document.querySelector(".banner"),
        divImgs: document.querySelector(".banner .imgs"),
        divDots: document.querySelector(".banner .dots"),
        divArrow: document.querySelector(".banner .arrow")
    },
    currentIndex: 0, //实际的图片索引
    timer: {
        //自动轮播计时器的设置
        duration: 16, //运动间隔的时间ms
        total: 300, //运动的总时间ms
        id: null //计时器的id，便于清除计时器
    },
    autoTimer: null //自动移动的计时器
};
//映射图片数量
config.imgNumber = config.doms.divImgs.children.length;
/* 初始化元素尺寸
 *  通过imgWidth和dotWidth以及imgNumber
 *  因为img资源需要进行动态的映射
 *  所以部分元素的尺寸通过js进行设置 
 */
function initSize() {
    config.doms.divDots.style.width = config.dotWidth * config.imgNumber + "px";
    config.doms.divImgs.style.width = config.imgWidth * (config.imgNumber + 2) + "px"
}
/* 
 *  初始化元素内容
 *  
 */
function initElements() {
    // 创建小圆点
    // 通过imgNumber设置相等数量的span元素
    for (var i = 0; i < config.imgNumber; i++) {
        var span = document.createElement("span");
        config.doms.divDots.appendChild(span);
    }
    //复制图片
    //设置图片流
    //为了实现无缝轮播，需要在前后添加尾首项
    var children = config.doms.divImgs.children;
    var first = children[0];
    var last = children[children.length - 1];
    var newImg = first.cloneNode(true); //深度克隆第一项，利于拼接
    config.doms.divImgs.appendChild(newImg);
    newImg = last.cloneNode(true); //深度克隆原来的最后一项，利于拼接
    config.doms.divImgs.insertBefore(newImg, first);
}

//初始化位置
//通过currentIndex设置位置
//index 0 -1  1  -2
function initPosition() {
    var left = (-config.currentIndex - 1) * config.imgWidth;
    config.doms.divImgs.style.marginLeft = left + "px";
}
// 设置小圆点的状态
// 通过currentIndex来确定active的小圆点，进行实时切换active
function setDotStatus() {
    for (var i = 0; i < config.doms.divDots.children.length; i++) {
        var dot = config.doms.divDots.children[i];
        if (i === config.currentIndex) {
            dot.className = "active";
        } else {
            dot.className = "";
        }
    }
}

function init() {
    initSize();
    initElements();
    initPosition();
    setDotStatus();
}

init();

//实现图片切换
// 
function indexTo(index, direction) {
    if (index === config.currentIndex) {
        return;
    }
    // 设置默认方向
    if (!direction) {
        direction = "left";
    }
    //设置新的margin-left
    var newLeft = (-index - 1) * config.imgWidth;
    //通过计时器进行动画补充
    animateSwitch();
    // 重新设置当前索引
    config.currentIndex = index;
    //重新设置控制组件状态
    setDotStatus();

    //通过计时器逐步改变marginLeft
    //需要求出每次计时器需要的改变，即每次运动的距离
    //可以使用总距离/运动次数
    function animateSwitch() {
        //清空之前的计时器，以防计时器累加
        stopAnimate();
        // 运动次数
        var number = Math.ceil(config.timer.total / config.timer.duration)
        //当前的运动次数
        var curNumber = 0;
        // 总距离
        var distance,
            marginLeft = parseFloat(getComputedStyle(config.doms.divImgs).marginLeft),
            totalWidth = config.imgNumber * config.imgWidth;
        if (direction === "left") {
            if (newLeft < marginLeft) {
                distance = newLeft - marginLeft;
            } else {
                distance = -(totalWidth - Math.abs(newLeft - marginLeft));
            }
        } else {
            if (newLeft > marginLeft) {
                distance = newLeft - marginLeft;
            } else {
                distance = (totalWidth - Math.abs(newLeft - marginLeft));
            }
        }
        // 每次改变的距离
        var everyDistance = distance / number;
        config.timer.id = setInterval(function () {
            marginLeft += everyDistance;
            //实现无缝切换
            if (direction === "left" && Math.abs(marginLeft) > totalWidth) {
                marginLeft += totalWidth;
            } else if (direction === "right" && Math.abs(marginLeft) < config.imgWidth) {
                marginLeft -= totalWidth;
            }
            config.doms.divImgs.style.marginLeft = marginLeft + "px";
            //到达目的就停止计时器
            curNumber++;
            if (curNumber === number) {
                stopAnimate();
            }
        }, config.timer.duration)
    }
    //清除动画
    function stopAnimate() {
        clearInterval(config.timer.id);
        config.timer.id = null;
    }
}
//设置点击事件
config.doms.divArrow.onclick = function (e) {
    if (e.target.classList.contains("left")) {
        toLeft();
    } else if (e.target.classList.contains("right")) {
        toRight();
    }
}

config.doms.divDots.onclick = function (e) {
    if (e.target.tagName === "SPAN") {
        var index = Array.from(this.children).indexOf(e.target);
        indexTo(index, index > config.currentIndex ? "left" : "right")
    }
}

function toLeft() {
    var index = config.currentIndex - 1;
    if (index < 0) {
        index = config.imgNumber - 1
    }
    indexTo(index, "right");
}

function toRight() {
    var index = (config.currentIndex + 1) % config.imgNumber;
    indexTo(index, "left");
}

config.autoTimer = setInterval(toRight,1000);

config.doms.divBanner.onmouseenter = function(){
    clearInterval(config.autoTimer);
    config.autoTimer = null;
}
config.doms.divBanner.onmouseleave = function(){
    if(config.autoTimer){
        return;
    }
    config.autoTimer = setInterval(toRight,1000);
}