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
    this.barHeight = options.barHeight || 50;
    this.lineStroke = 1;
    this.onLineStroke = 4;
    this.onclickCallback = options.onclickCallback;
    this.mouseoverCallback = options.mouseoverCallback;
    this.mouseoutCallback = options.mouseoutCallback;

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

    var myLine = self.vis.append('line').attr('x1', 1).attr('x2', 1).attr('y1', 1).attr('y2', self.barHeight).attr('stroke', 'green').attr('stroke-width', self.lineStroke);
    myLine.style("cursor", "pointer");

    myLine.on('mouseover', function(){ 
      myLine.attr('stroke-width', self.onLineStroke);
      self.mouseoverCallback();
    });

    myLine.on('mouseout', function() {
      myLine.attr('stroke-width', self.lineStroke);
      self.mouseoutCallback();
    });
    
    myLine.on('click', self.onclickCallback);
  }

  RtBarView.prototype.move = function(x, y) {
    var self = this;
    this.vis.attr('transform', 'translate(' + (x) + ',' + (y) + ')').style('left', x + 'px').style('left', y + 'px').style('position', 'relative');
    return this
  }

  return RtBarView;
});
