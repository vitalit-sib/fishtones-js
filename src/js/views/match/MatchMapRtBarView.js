/*
 * the disk with unrolled peptide coverage for PSM
 *
 * Copyright (c) 2013-2014, Genentech Inc.
 * All rights reserved.
 * Author: Alexandre Masselot, Bioinformatics & Computational Biology Department, Genentech
 */

define(['underscore', 'Backbone', '../commons/CommonWidgetView', 'fishtones/views/utils/RtBarView'], function(_, Backbone, CommonWidgetView, RtBarView) {

    MatchMapRtBarView = CommonWidgetView.extend({
        initialize : function(options) {
            var self = this;

            var spma = self.model;

            MatchMapRtBarView.__super__.initialize.call(self, arguments)

            var widgetOptions = {
                isSource: spma.get('isSource'),
                onclickCallback : spma.get('onclickCallback'),
                mouseoutCallback: spma.get('mouseoutCallback'),
                mouseoverCallback: spma.get('mouseoverCallback')
            };

            var widget = new RtBarView(self.el, widgetOptions);
           
            self.widgetRtBar = widget;
        },

        render : function() {
            var self = this;
            self.widgetRtBar.draw();
        },

        move : function(i, j, h) {
            this.widgetRtBar.move(i, j, h);
        }
    });

    return MatchMapRtBarView;
});

