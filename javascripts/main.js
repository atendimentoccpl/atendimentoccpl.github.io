var pageTitle = "CCPL";

var clockTimer,
    clockDiv,
    clockTemplate;
    
ready(function() {
    
  storage.load();
  
  initSecurity();
  
  initClock();
  initTitleChanging();

  initScreensaver();
});



function initClock() {

    clockDiv = document.querySelector("#clockDiv");
    clockTemplate = generateTemplate("#clockTemplate");

    //instaciate the InternetClock Class
    clock = new InternetClock();
    
    clock.timezone = storage.data.config.timezone;
    clock.daylightSaving  = storage.data.config.daylightsaving;
    
    clock.enabled  = storage.data.config.syncEnabled;
    clock.syncExpire  = storage.data.config.syncTimeout;

    //timer
    clockTimer = setInterval(clockTick, 1000);
}


function clockTick() {

    var date = clock.now();
    var obj = dateToObj(date);
    
    //append aditional data to obj
    obj.synced = clock.synced,
    obj.status = clock.status,
    obj.lastSync = new Date(clock.lastSync).toString(),
    obj.offset = clock.offset,
    
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


function initScreensaver() {
    window.ss = new ScreenSaver();

    //ss.debug = true;
    ss.timeout = storage.data.config.screensaverSettings;

    ss.element = document.querySelector("#screensaver");

    ss.onEnter = function() {
        document.querySelector("#contentFrame").style.display = "none";
        document.querySelector("#screensaver iframe").src = "home.html#screensaver";
    }
    ss.onExit = function() {
        document.querySelector("#contentFrame").style.display = "block";
        document.querySelector("#screensaver iframe").src = "about:blank";
    }

    ss.init();
}


function ScreenSaver() {

    var self = this;
    var timer = null;
    var debounceTimestamp;
    var mousemoveCount = 0;

    this.enabled = false;
    this.visible = false;
    this.timeout = 1000 * 60;
    this.debounce = 500;
    this.debounceMousemove = 3;

    this.onEnter = function() {};
    this.onExit = function() {};

    this.element = null;
    this.debug = false;

    this.init = function() {

        if (self.debug) console.log("ScreenSaver", "init");

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

    this.destroy = function() {

        if (self.debug) console.log("ScreenSaver", "destroy");

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

    function resetTimer() {
        if (timer) clearTimeout(timer);
        if(self.timeout>0){
          timer = setTimeout(enter, self.timeout);
        }
        else{
          self.enabled = false;
        }
    }

    function eventListener(event) {

        //if(self.debug) console.log("ScreenSaver","event", event);
        if(self.timeout==0) self.enabled = false;
        
        if (self.enabled) {

            if (self.visible) {

                if (event.type == "mousemove") {
                    mousemoveCount++;
                }

                exit(event.type);
            }

            resetTimer();
        }
    }

    function enter(event) {
        mousemoveCount = 0;
        debounceTimestamp = Date.now();
        if (self.debug) console.log("ScreenSaver", "enter", debounceTimestamp);

        if (self.onEnter) self.onEnter();
        if (self.element) self.element.style.display = "block";
        self.visible = true;
    }

    function exit(event) {

        if ((Date.now() - debounceTimestamp) < self.debounce) {
            if (self.debug) console.log("ScreenSaver", "debounced");
            return;
        }
        
        if (event=="mousemove" && mousemoveCount <= self.debounceMousemove) {
            if (self.debug) console.log("ScreenSaver", "mousemove debounced");
            return;
        }

        if (self.debug) console.log("ScreenSaver", "exit", event);
        if (self.onExit) self.onExit();
        if (self.element) self.element.style.display = "none";
        self.visible = false;
    }
}



/* Security  */

function initSecurity() {

    pwModal = new Modal(decryptionModal);

    //recall password
    var key = sessionStorage.getItem("key");
    if (key) {
        key = base64.decode(key);
    }

    var encryptedLinks = document.querySelectorAll('a[data-enc="AES-256"]');

    for (var i = 0; i < encryptedLinks.length; i++) {
        var a = encryptedLinks[i];

        a.onclick = encryptedLinkHandler;

        if (key) {
            encryptedLinkHandler({
                target: a
            });
        }

    }
}

function encryptedLinkHandler(e) {

    var a = e.target || this;
    var cipher = a.getAttribute('aes-href');
    var encrypted = (a.getAttribute('data-enc') == "AES-256") ? true : false;

    if (encrypted) {

        //recall password
        var key = sessionStorage.getItem("key");
        if (key) {
            key = base64.decode(key);

            var decrypted = Aes.Ctr.decrypt(cipher, key, 256);

            if (decrypted.match(/http/)) {

                console.log("Link decrypted.");

                a.href = decrypted;

                //a.removeAttribute('aes-href');
                a.setAttribute('data-enc', 'none');

                //remeber password for later
                sessionStorage.setItem("key", base64.encode(key));

            } else { //invalid pass
                //forget password
                sessionStorage.removeItem("key");
                key = null;
            }

        }

        if (!key) {

            if (e.preventDefault) e.preventDefault();

            pwModal.open(function (pw) {

                if (pw == null) return;

                var decrypted = Aes.Ctr.decrypt(cipher, pw, 256);

                if (decrypted.match(/http/)) {

                    console.log("Link decrypted.");

                    a.href = decrypted;

                    //a.removeAttribute('aes-href');
                    a.setAttribute('data-enc', 'none');

                    //remeber password for later
                    sessionStorage.setItem("key", base64.encode(pw));

                    a.dispatchEvent(new MouseEvent("click", {
                        "view": window,
                        "bubbles": true,
                        "cancelable": false
                    }));

                } else { //invalid pass

                    //forget password
                    sessionStorage.removeItem("key");
                    key = null;

                    alert("Senha Incorreta!");
                }

            });

        }


    }
}



function Modal(elm) {
    var self = this;

    this.DOM = {
        elm: elm,
        form: elm.querySelector('form'),
        close: elm.querySelector('.close'),
        pw: elm.querySelector('input[name="password"]'),
        remember: elm.querySelector('input[name="remember"]'),
        submit: elm.querySelector('input[type="submit"]')
    };

    this.callback = function () {};

    this.DOM.elm.style.display = "none";

    this.DOM.form.onsubmit = function (e) {

        self.callback(self.DOM.pw.value);

        e.preventDefault();
        self.close();
        return false;
    };

    this.DOM.close.onclick = function () {
        self.close();
        self.callback(null);
    }

    this.open = function (callback) {
        self.DOM.elm.style.display = "block";
        self.DOM.pw.focus();

        if (callback) self.callback = callback;
    }
    this.close = function () {
        self.DOM.elm.style.display = "none";
        self.DOM.pw.value = "";
    }
};


window.base64 = {
    encode: function (str) {
        return window.btoa(unescape((str)));
    },

    decode: function (str) {
        return (escape(window.atob(str)));
    }
};
