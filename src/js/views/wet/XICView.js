/**
 * display one XIC (+ plus msms matches eventually)
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore', 'Backbone', 'd3', '../commons/CommonWidgetView', 'fishtones/models/match/PSMAlignment', 'fishtones/views/utils/D3ScalingContext', 'fishtones/views/utils/D3ScalingArea', '../match/MatchMapPQView'], function (_, Backbone, d3, GFYViewView, PSMAlignment, D3ScalingContext, D3ScalingArea, MatchMapPQView) {

    XICView = CommonWidgetView.extend({
        initialize: function (options) {
            var self = this;
            XICView.__super__.initialize.call(this, arguments);
            self.richSequence = options.richSequence;
            if (options.scalingContext === undefined) {
                options.xDomain = [0, _.max(self.model.get('retentionTimes')) * 1.05];
                options.yDomain = [0, _.max(self.model.get('intensities')) * 1.1];
            }
            self.setupScalingContext(options);
            self.p_set_ms1points();
        
            if (self.richSequence) {
                self.p_set_msmsdata();
            }
            self.p_set_selectedRt();

            return self;
        },
        //return the class - well, I cannot figure what this os done like that...
        p_clazzCommon: function () {
            return 'chromato msms-alignment-icon charge_' + this.model.get('charge') + ' target_' + this.model.get('target');
        },

        //package the ms1 graph point (and get dtat ready for drawing)
        p_set_ms1points: function () {
            var self = this;
            var chromato = self.model;
            chromato._dataPoints = _.zip(chromato.get('retentionTimes'), chromato.get('intensities'))

            //console.log(ms1points)
            var selector = 'g.' + self.p_clazzCommon().replace(/\s+/g, '.');
            var cont = self.el.selectAll(selector);
            // cont.remove();
            cont = self.el.append('g');
            cont.attr('class', self.p_clazzCommon() + ' plot');

            var clazz = self.p_clazzCommon() + ' plot';
            //console.log('adding ms1point', ms1points)
            self.p1 = cont.selectAll("path." + clazz).data([chromato._dataPoints]).enter().insert("path");
        },
        // indicate the selected Rt as a red line
        p_set_selectedRt: function () {
            var self = this;
            var selRt = self.model.get('selectedRt');
            
            var rtBar = undefined;

            if(selRt){
                cont = self.el.append('g');
                cont.attr('class', self.p_clazzCommon() + ' rtBar');
    
                // add an empty line for the rtBar
                rtBar = cont.append('line');
            }

            self.selRtWidget = rtBar;
            self.selRt = selRt;

        },
        p_set_msmsdata: function () {
            var self = this;
            var chromato = self.model;

            self.msmsData = []

            _.each(chromato.get('msms').models, function (sp, i) {
                var spma = new PSMAlignment({
                    richSequence: self.richSequence,
                    expSpectrum: sp
                });

                var widget = new MatchMapPQView({
                    model: spma,
                    el: self.el,
                    radius: 12,
                    tol: self.tol
                });
                widget.widgetPQ.vis.attr('class', self.p_clazzCommon())

                self.msmsData.push({
                    widget: widget,
                    retentionTime: chromato.get('msmsPointers')[i].retentionTime,
                    intensity: chromato.get('msmsPointers')[i].intensity
                });
            })
            //drawing put them on the screen
            //actual drawing will move them to the correct position
            _.each(self.msmsData, function (msms) {
                msms.widget.render()
            });

        }
    });

    XICView.prototype.render = function (options) {
        var self = this;

        var chrm = self.model;

        var clazz = self.p_clazzCommon() + ' msms-annot';

        var x = self.scalingContext.x();//d3.scale.linear().domain(self.scalingContext.xScale.domain()).range(self.scalingContext.xScale.range())
        var y = self.scalingContext.y();//d3.scale.linear().domain(self.scalingContext.yScale.domain()).range(self.scalingContext.yScale.range())

        var pLine = d3.svg.line().x(function (d) {
            return x(d[0]);
        }).y(function (d) {
            return y(d[1])
        });

        var gp1 = self.p1.attr('class', clazz).attr('fill', 'none');
        gp1.attr("d", pLine(self.model._dataPoints));
        _.each(self.msmsData, function (msms) {
            msms.widget.move(x(msms.retentionTime), Math.min(y(msms.intensity), self.scalingContext.height() - 15))
        });

        // draw red line indicating Rt of selected value
        if(self.selRt){
            self.selRtWidget.attr('stroke', 'red').attr('stroke-width', 1);
            self.selRtWidget.attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', self.scalingContext.height());
            self.selRtWidget.attr('transform', 'translate(' + x(self.selRt) + ',' + 0 + ')').style('left', x + 'px').style('left', y + 'px').style('position', 'relative');
        }


    }

    return XICView;
});
