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
