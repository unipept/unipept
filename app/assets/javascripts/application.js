//= require jquery
//= require jquery_ujs
//= require twitter/bootstrap
//= require_self
//= require_tree .
//= require vendor

// add support for animate with color values
(function(d){d.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(f,e){d.fx.step[e]=function(g){if(!g.colorInit){g.start=c(g.elem,e);g.end=b(g.end);g.colorInit=true}g.elem.style[e]="rgb("+[Math.max(Math.min(parseInt((g.pos*(g.end[0]-g.start[0]))+g.start[0]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[1]-g.start[1]))+g.start[1]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[2]-g.start[2]))+g.start[2]),255),0)].join(",")+")"}});function b(f){var e;if(f&&f.constructor==Array&&f.length==3){return f}if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(f)){return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])]}if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(f)){return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55]}if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f)){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f)){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}if(e=/rgba\(0, 0, 0, 0\)/.exec(f)){return a.transparent}return a[d.trim(f).toLowerCase()]}function c(g,e){var f;do{f=d.curCSS(g,e);if(f!=""&&f!="transparent"||d.nodeName(g,"body")){break}e="backgroundColor"}while(g=g.parentNode);return b(f)}var a={transparent:[255,255,255]}})(jQuery);

/*
 * extend the jquery object to add a highlight effect method
 * usage: $("div").animateHighlight("#dd0000", 1000);
 * from: http://stackoverflow.com/questions/275931/how-do-you-make-an-element-flash-in-jquery
 */
$.fn.animateHighlight = function(highlightColor, duration) {
    var highlightBg = highlightColor || "#FFFF9C";
    var animateMs = duration || 1500;
    var originalBg = this.css("backgroundColor");
    this.stop().css("background-color", highlightBg).animate({backgroundColor: originalBg}, animateMs);
};

// function used to remove fields in the datasets form
function remove_fields(link) {
    $(link).prev("input[type=hidden]").val("1");
    $(link).closest(".fields").hide();
}

// function used to add field in the datasets form
function add_fields(link, association, content) {
    var new_id = new Date().getTime();
    var regexp = new RegExp("new_" + association, "g");
    $(link).parent().before(content.replace(regexp, new_id));
}

/* function for error handling.
 * first parameter is the error that gets logged to the console
 * second parameter is optional message to display to the user
 */
function error(error, userMessage) {
    if (typeof console != "undefined") { 
        console.error(error);
    }
    if(userMessage){
        $("#messages").append("<div class='alert alert-error'><strong>Oh snap!</strong> " + userMessage + "</div>");
    }
}