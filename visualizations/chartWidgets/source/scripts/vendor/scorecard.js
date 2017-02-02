/*

$().ready(function(){
	initScorecard('/result.json');
});
*/

export var init = function(data, scores, categories, requirements, el) {
	renderScorecard(
		{ 
			result: data,
			requirements: requirements.requirements,
			categories: categories.categories,
			scores: scores.scores
		}, el);
};

function renderScorecard(data, placeholder) {
	window.$ = window.jQuery;
	var countryScore = _.first(data.result);
	let hasProgress = false;
	let progress_values = _.filter(countryScore.score_req_values, function(v){return v.progress_value != null});
	hasProgress = (progress_values.length > 0);

	var table = $('<TABLE>').addClass('country_scorecard');
	var tableHeader = $('<THEAD>');

	var tableHeaderUpperRow = $('<TR>');
	tableHeaderUpperRow.append($('<TH>').attr('colspan', 2).html('EITI Requirements'));
	tableHeaderUpperRow.append($('<TH>').attr('colspan', 5).html('Level of Progress'));
	if(hasProgress) {
		tableHeaderUpperRow.append($('<TH>').attr('rowspan', 2).html('Direction <br/>of Progress'));
	}

	var tableHeaderLowerRow = $('<TR>');
	tableHeaderLowerRow.append($('<TH>').html('Categories'));
	tableHeaderLowerRow.append($('<TH>').html('Requirements'));
	tableHeaderLowerRow.append($('<TH>').addClass('scores').html('<div><span>No Progress</span></div>'));
	tableHeaderLowerRow.append($('<TH>').addClass('scores').html('<div><span>Inadequate</span></div>'));
	tableHeaderLowerRow.append($('<TH>').addClass('scores').html('<div><span>Meaningful</span></div>'));
	tableHeaderLowerRow.append($('<TH>').addClass('scores').html('<div><span>Satisfactory</span></div>'));
	tableHeaderLowerRow.append($('<TH>').addClass('scores').html('<div><span>Beyond</span></div>'));

	tableHeader.append(tableHeaderUpperRow);
	tableHeader.append(tableHeaderLowerRow);
	table.append(tableHeader);

	var tableBody = $('<TBODY>');
	table.append(tableBody);
	$(placeholder).append(table);

	//Append requirements rows based on the results
	appendRows(data, tableBody, hasProgress);
	var legend = $('<DIV>').addClass('scorecard-legend').html(getLegend());
	$(placeholder).append(legend);

	window.$ = undefined;
}

function getLegend() {
	var legendHTML = '<div class="scorecard-legend-item">' +
    '  <i style="background:#C00000">&nbsp;</i>' +
    '  <div>' +
    '    <strong>No progress.</strong> All or nearly all aspects of the requirement remain outstanding and the broader objective of the requirement is not fulfilled.' +
    '  </div>' +
    '</div>' +
    '<div class="scorecard-legend-item">' +
    '  <i style="background:#FAC433">&nbsp;</i>' +
    '  <div><strong>Inadequate progress.</strong> Significant aspects of the requirement have not been implemented and the broader objective of the requirement is far from fulfilled.' +
    '  </div>' +
    '</div>' +
    '<div class="scorecard-legend-item">' +
    '  <i style="background:#84AD42">&nbsp;</i>' +
    '  <div><strong>Meaningful progress.</strong> Significant aspects of the requirement have been implemented and the broader objective of the requirement is being fulfilled.</div>' +
    '</div>' +
    '<div class="scorecard-legend-item">' +
    '  <i style="background:#2D8B2A">&nbsp;</i>' +
    '  <div>Satisfactory progress.</strong> All aspects of the requirement have been implemented and the broader objective of the requirement has been fulfilled.</div>' +
    '</div>' +
    '<div class="scorecard-legend-item">' +
    '  <i style="background:#5182bb">&nbsp;</i>' +
    '  <div><strong>Beyond.</strong> The country has gone beyond the requirements.</div>' +
    '</div>' +
    '<div class="scorecard-legend-item">' +
    '  <i class="only_encouraged">&nbsp;</i>' +
    '  <div>This requirement is only encouraged or recommended and should not be taken into account in assessing compliance.</div>' +
    '</div>' +
    '<div class="scorecard-legend-item">' +
    '  <i class="not_applicable">&nbsp;</i>' +
    '  <div>The MSG has demonstrated that this requirement is not applicable in the country.</div>' +
    '</div>';

	return legendHTML;

}

function appendRows(data, tableBody, hasProgress) {
	var categories = data.categories;
	var requirements = data.requirements;
	var scores = data.scores;
	var result = data.result;

	var countryScore = _.first(data.result);

	_.each(categories, function(category) {
	    var bodyRow = $("<TR>");
	    tableBody.append(bodyRow);

	    var requirements_category = _.filter(requirements, function(requirement) {
	        return (requirement.Category === category.id);
	    });
	    bodyRow.append($("<TD>").attr('rowspan', requirements_category.length).addClass('requirement').html(category.name));

	    _.each(requirements_category, function(requirement, idx) {
	        var currentRow;
	        if (idx === 0) {
	            currentRow = bodyRow;
	        } else {
	            currentRow = $("<TR>");
	        }


	        let currentScore = undefined;
	        if (countryScore) {
		        currentScore = _.find(countryScore.score_req_values, function(value) {
		            return (value.score_req_id == requirement.id);
		        });

	        }
	        let req_cell = $("<TD>");
	        currentRow.append(req_cell.html(requirement.Requirement + ' (#' + requirement.Code + ') '));

	        // Requirement Answers
	        if (currentScore) {
	        	if(currentScore.description && currentScore.description !== "") {
			        let descriptionSpan = $("<DIV>").html("<BR/>" + currentScore.description).addClass("requirement_description").hide();
			        let button = $("<A>").addClass("requirement_button").html("(+)");
			        button.on("click", function(){
		        		if(button.html() === "(+)") {
		        			descriptionSpan.show();
		        			button.html("(-)");
		        		}
		        		else
		        		{
		        			descriptionSpan.hide();
		        			button.html("(+)");
		        		}
		        	});
		        	req_cell.append(button);
		        	req_cell.append(descriptionSpan);
			        //console.log(requirement.Code);

	        	}
	        	var cellStyle = '';
			    if (currentScore.is_applicable == 0) {
			        cellStyle = 'not_applicable ';
			        currentRow.append($("<TD>").attr('colspan', scores.length).addClass(cellStyle).html('&nbsp;'));
			    }
			    else if(currentScore.is_required === "1") //This means it's encouraged
			    {
			        cellStyle = 'only_encouraged ';
			        currentRow.append($("<TD>").attr('colspan', scores.length).addClass(cellStyle).html('&nbsp;'));
			    }
			    else
			    {
		            _.each(scores, function(value) {
		                var on = value.id;
		                var cellStatus = (Number(currentScore.value) === on);
		                cellStyle = cellStatus ? value.name.replace(/\s+/g, '_').toLowerCase() : '';
		                currentRow.append($("<TD>").addClass(cellStyle).html('&nbsp;'));
		            });
			    }

			    if(hasProgress){
			    	let symbol = {
			    		symbol: '&nbsp', 
			    		color: '#676767'
			    	};
			    	
			    	switch(currentScore.progress_value) {
			    		case "0": //Same
				    		symbol = {
					    		symbol: '&equals;', 
					    		color: '#676767'
					    	}
			    		break; 
			    		case "1": //Better
				    		symbol = {
					    		symbol: '&rarr;', 
					    		color: '#84AD42'
					    	}
			    		break; 
			    		case "2": //Worse
				    		symbol = {
					    		symbol: '&larr;', 
					    		color: 'red'
					    	}
			    		break; 
			    		case "3": //Empty
				    		symbol = {
					    		symbol: '&nbsp', 
					    		color: '#676767'
					    	}
			    		break; 

			    	}
			        var symbolElement = $("<DIV>").css({'color': symbol.color,'text-align': 'center', 'font-weight':'bold'}).html(symbol.symbol);
			        currentRow.append($("<TD>").append(symbolElement));
			    }

	        } else {
	            _.each(scores, function(value) {
	                currentRow.append($("<TD>").html('&nbsp;'));
	            });
			    if(hasProgress){
		            //Empty direction of progress
	                currentRow.append($("<TD>").html('&nbsp;'));
	            }
	        }
	        //Direction of Progress
	        tableBody.append(currentRow);
	    });
	});

// Overall Progress
	//let scores = [ {id:1}];
	var cellStyle = '';

	let currentScore = _.find(_.first(result).score_req_values, {"score_req_id" : "35"});
	let currentRow = $("<TR>");
	currentRow.append($("<TD>").attr('colspan', 2).css({'color': '#C00000', 'font-weight': 'bold'}).html('Overall assessment'));
    _.each(scores, function(value) {
        var on = value.id;
        var cellStatus = (Number(currentScore.value) === on);
        cellStyle = cellStatus ? value.name.replace(/\s+/g, '_').toLowerCase() : '';
        currentRow.append($("<TD>").addClass(cellStyle).html('&nbsp;'));
    });
    if(hasProgress){
    	let symbol = {
    		symbol: '&nbsp', 
    		color: '#676767'
    	};
    	
    	switch(currentScore.progress_value) {
    		case "0": //Same
	    		symbol = {
		    		symbol: '&equals;', 
		    		color: '#676767'
		    	}
    		break; 
    		case "1": //Better
	    		symbol = {
		    		symbol: '&rarr;', 
		    		color: '#84AD42'
		    	}
    		break; 
    		case "2": //Worse
	    		symbol = {
		    		symbol: '&larr;', 
		    		color: 'red'
		    	}
    		break; 
    		case "3": //Empty
	    		symbol = {
		    		symbol: '&nbsp', 
		    		color: '#676767'
		    	}
    		break; 

    	}
        var symbolElement = $("<DIV>").css({'color': symbol.color,'text-align': 'center', 'font-weight':'bold'}).html(symbol.symbol);
        currentRow.append($("<TD>").append(symbolElement));
    }


	tableBody.append(currentRow);

}




