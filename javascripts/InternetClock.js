/**
 * InternetClock.js
 * @author Victornpb github.com/victornpb
 */

function InternetClock() {
    var self = this;

    this.offset = 0;
    this.lastSync = 0;
    this.syncExpire = 1000 * 60 * 5; //resync with internet every 5 minutes

    this.status = "Hora Local";
    this.synced = false;
    this.syncTriggered = false;
    
    this.requestTimeout = 1000*30;

    function getWorldTime(onCompleted, onLoad, onFailed) {
        
        if (onFailed) {
            var timer = setTimeout(function(){onFailed("Request timed out");}, self.requestTimeout);
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
                        t = new Date(t);
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
        //console.log("Clock Sync Requested");
        self.synced = false;
        self.status = "Sync Started";

        getWorldTime(function(remoteDate) {
                //console.log("Remote Clock Received", remoteDate);

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
                console.log(s);
                self.lastSync = Date.now();
                self.syncTriggered = false;

                self.synced = false;
                self.status = (self.offset?"":"Hora Local")+" Sync Failed";

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


//misc functions

function AddZero(num) {
    return (num >= 0 && num < 10) ? "0" + num : num + "";
}
