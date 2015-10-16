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
