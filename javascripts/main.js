clearAllTimeouts();
//clear all timeouts, hack fix for liveweave 
function clearAllTimeouts(){
    var maxId = setTimeout(function() {}, 0);
    for (var i = 0; i < maxId; i += 1) {
        clearTimeout(i);
    }
}

var pageTitle = "CCPL";

window.onload = function() {

    initClock();
    initTitleChanging();
    
    
    window.ss = new ScreenSaver();
    ss.debug = true;
    ss.timeout = 1000*30;
    
    ss.element = document.querySelector("#screensaver");
    
    ss.onEnter = function(){
    	document.querySelector("#contentFrame").style.display = "none";
    	document.querySelector("#screensaver iframe").src = "home.html#screensaver";
    }
    ss.onExit = function(){
    	document.querySelector("#contentFrame").style.display = "block";
    	document.querySelector("#screensaver iframe").src = "about:blank";
    }
    
    ss.init();
}



var clockTimer,
    clockDiv,
    clockTemplate;

function initClock() {
    
    clockDiv = document.querySelector("#clockDiv");
    clockTemplate = generateTemplate("#clockTemplate");
    
    //instaciate the InternetClock Class
    clock = new InternetClock();
    
    //timer
    clockTimer = setInterval(clockTick, 1000);
}


function clockTick() {
    
    var date = clock.now();
    
    var obj = {
        synced: clock.synced,
        status: clock.status,
        lastSync: new Date(clock.lastSync).toString(),
        offset: clock.offset,
        
        HH: date.getHours(),
        hh: ((date.getHours() + 11) % 12 + 1),
        mm: AddZero(date.getMinutes()),
        ss: AddZero(date.getSeconds()),
        ms: AddZero(date.getMilliseconds()),
        tt: date.getHours() >= 12 ? "PM" : "AM",

        dd: AddZero(date.getDate()),
        ddd: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][date.getDay()],
        dddd: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sabado"][date.getDay()],
        mo: AddZero(date.getMonth() + 1),
        moo: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][date.getMonth()],
        yy: date.getFullYear() - 2000,
        yyyy: date.getFullYear(),
        saudacao: (date.getHours() < 12) ? "Bom dia" : (date.getHours() < 18) ? "Boa tarde" : "Boa noite"
    };
    
    clockDiv.innerHTML = clockTemplate.apply(obj);
    
}



function initTitleChanging() {

    //title management
    document.querySelector(".navbar").onclick = function(ev) {
        //console.log(ev);
        var elm = ev.target;

        if (elm.tagName == "A" && elm.href) {

            if (elm.className != "dropdown-toggle") {

                var tabTitle = elm.getAttribute("data-title") || elm.innerText;

                document.title = "{tab} - {pageTitle}".formatWithObj({
                    tab: tabTitle,
                    pageTitle: pageTitle
                });
            }

        }

    }
}


/*!
 * Dynamically changing favicons with JavaScript
 * Works in all A-grade browsers except Safari and Internet Explorer
 * Demo: http://mathiasbynens.be/demo/dynamic-favicons
 */

// HTML5™, baby! http://mathiasbynens.be/notes/document-head
document.head = document.head || document.getElementsByTagName('head')[0];

function changeFavicon(src) {
    var link = document.createElement('link'),
        oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = src;
    if (oldLink) {
        document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
}



function ScreenSaver(){
    
    var self = this;
    var timer = null;
    var debounceTimestamp;
    
    this.enabled = false;
    this.visible = false;
    this.timeout = 1000*60;
    this.debounce = 1000;
    
    this.onEnter = function(){};
    this.onExit = function(){};
    
    this.element = null;    
    this.debug = false;
    
	this.init = function(){
        
        if(self.debug) console.log("ScreenSaver","init");
        
        //mouse
        document.addEventListener('mousemove', eventListener, false);
        document.addEventListener('mousewheel', eventListener, false);
        document.addEventListener('mousedown', eventListener, false);
        document.addEventListener('mouseup', eventListener, false);
        
        //keyboard
        document.addEventListener('keypress', eventListener, false);
        document.addEventListener('keydown', eventListener, false);
        document.addEventListener('keyup', eventListener, false);
        
        //touch
        document.addEventListener('touchstart', eventListener, false);
        document.addEventListener('touchdown', eventListener, false);
        document.addEventListener('touchup', eventListener, false);
        
        //browser
        document.addEventListener('scroll', eventListener, false);
		
        //start timer
        resetTimer();
        
        self.enabled = true;
    }
    
    this.destroy = function(){
        
        if(self.debug) console.log("ScreenSaver","destroy");
        
        //mouse
        document.removeEventListener('mousemove', eventListener);
        document.removeEventListener('mousewheel', eventListener);
        document.removeEventListener('mousedown', eventListener);
        document.removeEventListener('mouseup', eventListener);
        
        //keyboard
        document.removeEventListener('keypress', eventListener);
        document.removeEventListener('keydown', eventListener);
        document.removeEventListener('keyup', eventListener);
        
        //touch
        document.removeEventListener('touchstart', eventListener);
        document.removeEventListener('touchdown', eventListener);
        document.removeEventListener('touchup', eventListener);
        
        //browser
        document.removeEventListener('scroll', eventListener);
        
    	clearTimeout(timer);
        exit("destroy");
        
        self.enabled = false;
    }
	
    function resetTimer(){
    	if(timer) clearTimeout(timer);
        timer = setTimeout(enter, self.timeout);
    }
    
    function eventListener(event){
    	
    	//if(self.debug) console.log("ScreenSaver","event", event);
		
        if(self.enabled){

            if(self.visible){
                exit(event.type);
            }

            resetTimer();
        }
    }
    
    function enter(){
        debounceTimestamp = Date.now();
        if(self.debug) console.log("ScreenSaver","enter", debounceTimestamp);
              
        if(self.onEnter) self.onEnter();
        if(self.element) self.element.style.display = "block";
        self.visible = true;
    }
    
    function exit(ev){
        if((Date.now()-debounceTimestamp)<self.debounce){
			if(self.debug) console.log("ScreenSaver","debounced");
			return;
        }
        
        if(self.debug) console.log("ScreenSaver","exit", ev);
        if(self.onExit) self.onExit();
        if(self.element) self.element.style.display = "none";
        self.visible = false;
    }
}
