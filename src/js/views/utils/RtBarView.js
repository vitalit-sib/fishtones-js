/**
 * Instead of the PQ we're showing a simple bar at the position of a MSMS event
 *
 * Copyright (c) 2016, SIB
 * All rights reserved.
 * Author: Roman Mylonas, SIB Switzerland
 */

define(['underscore', 'd3'], function(_, d3) {

  RtBarView = function(target, options) {

    options = $.extend({}, options);
    this.lineStroke = 1;
    this.onLineStroke = 5;
    this.isSource = options.isSource;
    this.isIdentified = options.isIdentified;
    this.onclickCallback = options.onclickCallback;
    this.mouseoverCallback = options.mouseoverCallback;
    this.mouseoutCallback = options.mouseoutCallback;
    this.mousemoveCallback = options.mousemoveCallback;

    if ( typeof target == 'object') {
      this.vis = target.append('g');
    } else {
      this.vis = d3.select(target).append('g');
    }
  }

  RtBarView.prototype.build = function(sectorClasses, rectBuildFunction) {
    var self = this;
    self.len = sectorClasses.length;
    self.sectorClasses = sectorClasses;
  }

  RtBarView.prototype.draw = function(options) {
    var self = this;

    var barColor = 'green';
    if(self.isSource) barColor = 'red';
    if(! self.isIdentified) barColor = 'silver';

    var myLine = self.vis.append('line').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', 1).attr('stroke', barColor).attr('stroke-width', self.lineStroke);
    myLine.style("cursor", "pointer");

    myLine.on('mouseover', function(){ 
      myLine.attr('stroke-width', self.onLineStroke);
      if(self.mouseoverCallback){
        self.mouseoverCallback();
      }
    });

    myLine.on('mouseout', function() {
      myLine.attr('stroke-width', self.lineStroke);
      if(self.mouseoutCallback){
        self.mouseoutCallback();
      }
    });
    
    if(self.onclickCallback){
      myLine.on('click', self.onclickCallback);
    }
  }

  RtBarView.prototype.move = function(x, y, height) {
    var self = this;
    this.vis.selectAll('line').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', height);
    this.vis.attr('transform', 'translate(' + (x) + ',' + (y) + ')').style('left', x + 'px').style('left', y + 'px').style('position', 'relative');
    return this
  }

  return RtBarView;
});
