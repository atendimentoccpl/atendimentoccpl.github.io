var pageTitle = "CCPL";

window.onload = function() {

    initClock();
    initTitleChanging();

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

