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
            MatchMapRtBarView.__super__.initialize.call(this, arguments)

            self.barHeight = options.barHeight|| 50;
            this.onclickCallback = options.onclickCallback;
            this.mouseoverCallback = options.mouseoverCallback;
            this.mouseoutCallback = options.mouseoutCallback;

            var spma = self.model;

            var widget = new RtBarView(self.el, {
                barHeight : self.barHeight,
                onclickCallback : this.onclickCallback,
                mouseoutCallback: this.mouseoutCallback,
                mouseoverCallback: this.mouseoverCallback
            });
           
            self.widgetRtBar = widget;
        },

        render : function() {
            var self = this;
            self.widgetRtBar.draw();
        },

        move : function(i, j) {
            this.widgetRtBar.move(i, j);
        }
    });

    return MatchMapRtBarView;
});

