function initHome() {
	// load a dataset from the local database
    $(".load-dataset").click(function(){
		var url = $(this).parent().find("select").val(),
			name = $(this).parent().find("select option:selected").text();
		
		_gaq.push(['_trackEvent', 'Datasets', 'Load', 'Database - ' + name]);
		
		$("#more_options a").click();
		$("#search_name").val(name);
		$.get(url, function(data) {
		  $("#qs").val(data);
			$('html, body').animate({
				scrollTop: $("#search_elements").parent().parent().offset().top
			 }, 1000);
			$("#qs").animateHighlight(null, 2000);
			$("#search_name").animateHighlight(null, 2000);
		});
		return false;
	});
	
	// load a PRIDE dataset
	$(".load-pride").click(function(){
		var experiment = $("#pride_exp_id").val();
		$("#more_options a").click();
		$("#search_name").val("PRIDE experiment " + experiment);
		$.get("/pride/" + experiment, function(data) {
		  $("#qs").val(data);
			$('html, body').animate({
				scrollTop: $("#search_elements").parent().parent().offset().top
			 }, 1000);
			$("#qs").animateHighlight(null, 2000);
			$("#search_name").animateHighlight(null, 2000);
		});
		return false;
	});
};