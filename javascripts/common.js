function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState != 'loading')
        fn();
    });
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






/**
* LocalStorage serialization/deserialization abstraction.
*/
function Storage(namespace){
    var self = this;
    
	this.namespace = namespace;
    this.data = {};
    
    if(!namespace){
    	throw new Error("namespace is not defined");
    }
    
    this.load = function(){
        var json = localStorage.getItem(self.namespace);
        if(json){
        	self.data = JSON.parse(json);
        }
        return self.data;
    };

	this.save = function(){
        var json = JSON.stringify(self.data);
        localStorage.setItem(self.namespace, json);
    };
}





/**
 * formStorage.js
 * @author Victor N - www.vitim.us
 * Created on 21-jan-2012
 * 
 * Use saveFormToObject() store the state of all input elements of a form automaticly and export to Object or JSON
 * Use loadFormFromObject() to read the Object or JSON stored and update the state of all input elements of a form
 * 
 * All inputs, textareas, and selects that have a ID name is stored,
 * if a element doesn't have a ID it will be ignored.
 * 
 * The JSON text can be transmited via Ajax or stored to LocalStorage or Cookies
 * 
 * If 2 elements have the same ID information will be replaced, and cause possible crash on loadFormFromObject
 * 
 */

var formStorage = {

    /**
     * Save all input elements and theirs properties of a form in a Object
     * @param {Element} form Reference to an <form> element
     * @param {Boolean} outputToJson True will return a String in JSON format
     */
    saveFormToObject : function (form, outputToJson) {

        var tagList = ['INPUT', 'TEXTAREA', 'SELECT'];
        var object = {};

        var elements = form.getElementsByTagName('*');

        for (var element in elements) { //all elements

            element = elements[element];

            for (var i = 0; i < tagList.length; i++) { //check tagList

                if (element.id != undefined && element.tagName == tagList[i]) {
                    object[element.id] = formStorage.getAttributes(element);
                    break;
                }
            }
        }

        if (outputToJson) {
            object = JSON.stringify(object);
        } //Convert [Object object] to JSON String

        return (object);
    },


    /**
     * Load a Object stored by saveFormToObject() and update the DOM properties
     * @param {Element} form Reference to an <form> element
     * @param {Object} object A Object with the properties stored (Object or JSON)
     */
    loadFormFromObject : function (form, object) {

        var tagList = ['INPUT', 'TEXTAREA', 'SELECT'];

        if (typeof object === "string") {
            object = JSON.parse(object);
        } //Convert JSON String to [Object object]

        var elements = form.getElementsByTagName('*');
        for (var element in elements) { //All elements
            element = elements[element]; //current element

            for (var i = 0; i < tagList.length; i++) { //check tagList
                if (element.id != undefined && (element.tagName == tagList[i])) {
                    formStorage.setAttributes(element, object[element.id]);
                    break;
                }
            }


        }
    },


    /**
     * Extract properties of a element and return a Object
     * @param {Element} element Reference to a element
     */
    getAttributes : function (element) {
        if (element.id != undefined) {

            var object = {};

            var attList = ['id', 'name', 'type', 'value', 'title', 'alt', 'placeholder',
                'disabled', 'checked', 'selected', 'readonly', 'src', 'selectedIndex'];

            for (var i = 0; i < attList.length; i++) { //all attributes equals to attList
                var att = attList[i];

                if (element[att] != undefined && element[att] != "") {
                    object[att] = element[att];
                }
            }

            return object;
        }
    },


    /**
     * Read a Object and update their properties
     * @param {Element} element 
     * @param {Object} object
     */
    setAttributes : function (element, object) {

        if (object.id != undefined) { //this input have settings stored on obj?

            for (var attribute in object) {
                element[attribute] = object[attribute]; //load attribute from object
            }
        }
    }

};
