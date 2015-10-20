/**
 * InternetClock.js
 * @author Victornpb github.com/victornpb
 */

function InternetClock() {
    var self = this;
    
    this.debug = false;
    
    this.timezone = -3;
    this.daylightSaving = true;
    
    this.offset = 0;
    this.lastSync = 0;
    this.syncExpire = 1000 * 60 * 5; //resync with internet every 5 minutes
    
    this.synced = false;
    this.syncTriggered = false;
    this.status = "Hora Local";
    
    this.requestTimeout = 1000*30;
    
    function getUTCWorldTime(onCompleted, onLoad, onFailed) {
        
        if (onFailed) {
            var timer = setTimeout(function(){ onFailed("Request timed out"); }, self.requestTimeout);
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
                    var success = true;
                    var result = Ajax.responseText;
                    try {
                        var json = JSON.parse(result);
                        if (onFailed) clearTimeout(timer);
                        var t = json["currentDateTime"];
                        t = convertDateToUTC(new Date(t));
                    } catch (err) {
                        success = false;
                        if (onFailed) {
                            clearTimeout(timer);
                            onFailed(err);
                        }
                    }
                    
                    if(success){
                        onCompleted(t, result);
                    }

                }
            };
            Ajax.open('GET', url, true);
            Ajax.send(parameters);
        } else {
            if (onFailed) {
                clearTimeout(timer);
                onFailed("No Ajax");
            }
        }
    }

    this.sync = function(callback) {
        if(self.debug) console.log("InternetClock","Sync Requested");
        self.synced = false;
        self.status = "Sync Started";

        getUTCWorldTime(function(remoteDate) {
                if(self.debug) console.log("InternetClock","Remote Clock Received (UTC)", remoteDate);

                self.syncTriggered = false;
                self.synced = true;
                self.status = "Synced";

                self.lastSync = Date.now();
                self.calcOffset(new Date(remoteDate), convertDateToUTC(new Date()));
                if (callback) callback(self);
            },
            function(s) { //loading
                if(self.debug) console.log("InternetClock","Request Loading", s);
                self.synced = false;
                self.status = s;
            },
            function(s) { //failed
                if(self.debug) console.log("InternetClock","Request Failed", s);    
                console.log(s);
                self.lastSync = Date.now();
                self.syncTriggered = false;

                self.synced = false;
                self.status = (self.offset?"":"Hora Local")+" Sync Failed";
            });
    };

    this.getCompensatedDate = function(date) {
        if ((Date.now() - self.lastSync > self.syncExpire || self.lastSync === 0) && self.syncTriggered === false) {
            if(self.debug) console.log("InternetClock","Last sync expired, syncTriggered.");
            
            self.syncTriggered = true;
            self.synced = false;
            self.status = "Force Sync";

            self.sync();
        }

        return new Date(date.getTime() + self.offset);
    };

    this.calcOffset = function calcOffset(dateLocal, dateRemote) {
        self.offset = dateLocal - dateRemote;
        if(self.debug) console.log("InternetClock","Offset calculated", self.offset);
    };

    this.now = function() {
        var t = self.getCompensatedDate(convertDateToUTC(new Date()));
        t.setHours(t.getHours() + self.timezone + (self.daylightSaving?1:0));
        return t;
    };
    
    function createDateAsUTC(date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    }
    
    function convertDateToUTC(date) { 
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); 
    }
    
    
}


//misc functions

function AddZero(num) {
    return (num >= 0 && num < 10) ? "0" + num : num + "";
}

function dateToObj(date){
    return ({
        HH: date.getHours(),
        hh: ((date.getHours() + 11) % 12 + 1),
        mm: AddZero(date.getMinutes()),
        ss: AddZero(date.getSeconds()),
        ms: AddZero(date.getMilliseconds()),
        tt: date.getHours() >= 12 ? "PM" : "AM",
        
        dd: AddZero(date.getDate()),
        ddd: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][date.getDay()],
        dddd: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sabado"][date.getDay()],
        ddddd: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sabado"][date.getDay()],
        mo: AddZero(date.getMonth() + 1),
        moo: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][date.getMonth()],
        mooo: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][date.getMonth()],
        yy: date.getFullYear() - 2000,
        yyyy: date.getFullYear(),
        saudacao: (date.getHours() < 12) ? "Bom dia" : (date.getHours() < 18) ? "Boa tarde" : "Boa noite"
    });
}
