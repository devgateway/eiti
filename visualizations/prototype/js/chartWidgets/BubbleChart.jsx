let React = require('react');
let d3 = require('d3');

import { findDOMNode } from 'react-dom';

let Chart = require('./Chart');
let Tooltip = require('./Tooltip');

let DefaultPropsMixin = require('./DefaultPropsMixin');
let HeightWidthMixin = require('./HeightWidthMixin');
let AccessorMixin = require('./AccessorMixin');
let TooltipMixin = require('./TooltipMixin');

let DataSet = React.createClass({
	componentDidUpdate: function(nextProps, nextState) {
		console.log("updating component");
		let {data, diameter, width, height} = this.props;

		let el = findDOMNode(this);

		d3.select(el).select("svg").remove(); // clear nodes with state change

	    let svg = d3.select(el).append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "bubble");        

		let format = d3.format(",d"),
            color = d3.scale.category20c();

        let bubble = d3.layout.pack()
            .sort(null)
            .size([diameter, diameter])
            .padding(1.5);

		let node = svg.selectAll(".node")
              .data(bubble.nodes(this.classes(data))
              .filter(function(d) { return !d.children; }))
              .enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          node.append("title")
              .text(function(d) { return d.className + ": $" + format(d.value); });

          node.append("circle")
              .attr("r", function(d) { return d.r; })
              .style("fill", function(d) { return color(d.packageName); });

          node.append("text")
              .attr("dy", ".3em")
              .style("text-anchor", "middle")
              .text(function(d) { return d.className.substring(0, d.r / 3); });

        //d3.select(self.frameElement).style("height", height + "px");
	},	

	// Returns a flattened hierarchy containing all leaf nodes under the root.
    classes: function(root) {
      var classes = [];      

      function recurse(name, node) {
        if (node.children) {
        	node.children.forEach(function(child) { 
        		recurse(node.name, child); 
        	});
        } else {
        	classes.push({packageName: name, className: node.name, value: node.size});
        }
      }

      recurse(null, root);
      return {children: classes};
    },

	render() {
		return (
                <div></div>
        );
    }
});

let BubbleChart = React.createClass({
	mixins: [DefaultPropsMixin,
			 HeightWidthMixin,
			 AccessorMixin,
			 TooltipMixin],

	getInitialState: function() {
		return {
	    	chartData: {
			  "name": "",
  				"children": [
			        {
			          "name": "",
			          "size": 0
			        }
			    ]
			}
		}
	},

	updateData: function(props) {
		if(props.dataURL) {
			var _this = this;
			/* Old school AJAX request to try to stay away from jQuery */
			var req = new XMLHttpRequest();
			req.onreadystatechange = function() {
			    if (req.readyState == 4 && req.status == 200) {
			    	var data = JSON.parse(req.responseText);
			    	if(props.processor) {
               			var processedData = props.processor(data);
			    	  	_this.setState({chartData: processedData});
		            } else {
		              	_this.setState({chartData: data});
		            }
			    }
			  }
			req.open("GET", props.dataURL, true);
			req.send();
		}
		else if(props.chartData) {			
			this.setState({chartData: props.chartData});
		}
	},

	componentWillMount: function() {
		this.updateData(this.props);
	},

	componentWillReceiveProps: function(nextProps) {
		this.updateData(nextProps);
	},

	render() {
		let {width,
			 height,
			 margin,
			 diameter,
			 chartTitle} = this.props;

		return (
			<div>	
					<h3 className={"chartTitle"}>{chartTitle}</h3>			
					<DataSet
            		data={this.state.chartData}
            		width={width}
            		height={height}
            		margin={margin}  
            		diameter={diameter}		           		
            		/>
			</div>
		);
	}
});

module.exports = BubbleChart;
