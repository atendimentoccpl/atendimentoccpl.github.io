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



function compileTemplate(html) {
    var re = /{{([^}]*(?:}[^}]+)*}*)}}/g,
        reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
        code = 'var r=[];\n', cursor = 0, match;
    
    var add = function(line, js) {
        js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    }
    while(match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    
    var template = new Function(code.replace(/[\r\t\n]/g, ''));
    return template;
}

function generateTemplate(selector){
    var el = document.querySelector(selector);
    if(el.type.toLowerCase()=="template/html"){
        return compileTemplate(el.innerHTML);
    }
    else throw Error("Type of '"+selector+"' is not a template/html");
}
