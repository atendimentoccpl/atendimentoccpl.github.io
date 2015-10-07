//clear all timeouts, hack fix for liveweave 
var maxId = setTimeout(function() {}, 0);
for (var i = 0; i < maxId; i += 1) {
    clearTimeout(i);
}


function initClock() {

    clock = new InternetClock();

    setInterval(function() {
        saudacaoDiv.innerHTML = (!clock.synced ? "(" + clock.status + ")" : "");
        clockDiv.innerHTML = formatedDate(" {saudacao}, {ddd} {dd}/{moo}/{yy} {hh}:{mm}:{ss} {tt}", clock.now());
    }, 1000);

}


if (!String.prototype.formatWithObj) {
    String.prototype.formatWithObj = function() {
        var str = this.toString();
        if (!arguments.length)
            return str;
        var args = typeof arguments[0],
            args = (("string" == args || "number" == args) ? arguments : arguments[0]);
        for (arg in args)
            str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
        return str;
    };
}



function formatedDate(format, date) {

    function AddZero(num) {
        return (num >= 0 && num < 10) ? "0" + num : num + "";
    }

    var t = {
        HH: date.getHours(),
        hh: ((date.getHours() + 11) % 12 + 1),
        mm: AddZero(date.getMinutes()),
        ss: AddZero(date.getSeconds()),
        ms: AddZero(date.getMilliseconds()),
        tt: date.getHours() >= 12 ? "PM" : "AM",

        dd: AddZero(date.getDate()),
        ddd: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][date.getDay()],
        mo: AddZero(date.getMonth() + 1),
        moo: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][date.getMonth()],
        yy: date.getFullYear() - 2000,
        yyyy: date.getFullYear(),
        saudacao: (date.getHours() < 12) ? "Bom dia" : (date.getHours() < 18) ? "Boa tarde" : "Boa noite"
    };

    return format.formatWithObj(t);
}




function InternetClock() {
    var self = this;

    this.offset = 0;
    this.lastSync = 0;
    this.syncExpire = 1000 * 30;

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




