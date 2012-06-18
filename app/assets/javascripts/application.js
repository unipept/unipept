//= require jquery
//= require jquery_ujs
//= require_self
//= require_tree .
//= require vendor

// function used to remove fields in the datasets form
function remove_fields(link) {
  $(link).prev("input[type=hidden]").val("1");
  $(link).closest(".fields").hide();
}

// function used to add field in the datasets form
function add_fields(link, association, content) {
  var new_id = new Date().getTime();
  var regexp = new RegExp("new_" + association, "g")
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
        $("#messages").append("<div class='error'>" + userMessage + "</div>");
    }
}