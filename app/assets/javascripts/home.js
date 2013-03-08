function initHome() {
	// load a dataset from the local database
    $(".load-dataset").click(function(){
		// set the vars
		var url = $(this).parent().find("select").val(),
			name = $(this).parent().find("select option:selected").text();
		
		// GA event tracking
		_gaq.push(['_trackEvent', 'Datasets', 'Load', 'Database - ' + name]);
		
		// load the datasets
		loadDataset(url, name);
		return false;
	});
	
	// load a PRIDE dataset
	$(".load-pride").click(function(){
		// set the vars
		var experiment = $("#pride_exp_id").val(),
			url = "/pride/" + experiment,
			name = "PRIDE experiment " + experiment;
			
		// GA event tracking
		_gaq.push(['_trackEvent', 'Datasets', 'Load', 'Pride - ' + experiment]);

		// load the datasets
		loadDataset(url, name);
		return false;
	});
	
	function loadDataset(url, name){
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
	}
};