clearAllTimeouts();
//clear all timeouts, hack fix for liveweave 
function clearAllTimeouts(){
    var maxId = setTimeout(function() {}, 0);
    for (var i = 0; i < maxId; i += 1) {
        clearTimeout(i);
    }
}

function AddZero(num) {
    return (num >= 0 && num < 10) ? "0" + num : num + "";
}

var clockTimer;

function initClock() {
    
    var clockDiv = document.querySelector("#clockDiv");
    
    //generate template
    var clockTemplate = generateTemplate("#clockTemplate");
    
    //instaciate the InternetClock Class
    clock = new InternetClock();

    //timer
    clockTimer = setInterval(function() {
        
        var date = clock.now();
        
        var obj = {
            synced: clock.synced,
            status: clock.status,
            
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
        
    }, 500);

}


function InternetClock() {
    var self = this;

    this.offset = 0;
    this.lastSync = 0;
    this.syncExpire = 1000 * 60 * 5; //resync with internet every 5 minutes

    this.status = "Hora Local";
    this.synced = false;
    this.syncTriggered = false;

    function getWorldTime(onCompleted, onLoad, onFailed) {
        var timeout = 5;
        if (onFailed) {
            var timer = setTimeout(onFailed, timeout);
        }
        var parameters = "";
        var url = "http://worldclockapi.com/api/json/utc/now";
        var Ajax = (function() {
            try {
                return new XMLHttpRequest();
            } catch (e) {
                try {
                    return new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    try {
                        return new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (e) {
                        return null;
                    }
                }
            }
        })();
        if (Ajax) {
            Ajax.onreadystatechange = function() {
                if (Ajax.readyState < 4) {
                    if (onLoad) onLoad("Sincronizando", Ajax.onreadystatechange);
                } else {

                    var result = Ajax.responseText;
                    if (result) {

                        try {
                            var json = JSON.parse(result);
                            if (onFailed) clearTimeout(timer);
                            var t = json["currentDateTime"];
                            t = new Date(t);
                        } catch (err) {
                            if (onFailed) {
                                clearTimeout(timer);
                                onFailed(err);
                            }
                        }

                        onCompleted(t, result);

                    } else {
                        if (onFailed) {
                            clearTimeout(timer);
                            onFailed();
                        }
                    }
                }
            };
            Ajax.open('GET', url, true);
            Ajax.send(parameters);
        } else {
            if (onLoad) onLoad("No Ajax");
        }
    }

    this.sync = function(callback) {
        console.log("Clock Sync Requested");
        self.synced = false;
        self.status = "Sync Started";

        getWorldTime(function(remoteDate) {
                console.log("Remote Clock Received", remoteDate);

                self.syncTriggered = false;
                self.synced = true;
                self.status = "Synced";

                self.lastSync = Date.now();
                self.calcOffset(new Date(remoteDate), new Date());
                if (callback) callback(self);
            },
            function(s) { //loading
                self.synced = false;
                self.status = s;
            },
            function(s) { //failed
                self.lastSync = Date.now();
                self.syncTriggered = false;

                self.synced = false;
                self.status = "Sync Failed";

            });
    };

    this.getCompensatedDate = function(date) {
        if ((Date.now() - self.lastSync > self.syncExpire || self.lastSync === 0) && self.syncTriggered === false) {
            console.log("Force Resync");
            self.syncTriggered = true;

            self.synced = false;
            self.status = "Force Sync";

            self.sync();
        }

        return new Date(date.getTime() + self.offset);
    };

    this.calcOffset = function calcOffset(dateLocal, dateRemote) {
        self.offset = dateLocal - dateRemote;
    };

    this.now = function() {
        return self.getCompensatedDate(new Date());
    };
}

