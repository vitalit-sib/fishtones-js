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

            this.onclickCallback = options.onclickCallback;
            this.mouseoverCallback = options.mouseoverCallback;
            this.mouseoutCallback = options.mouseoutCallback;

            var spma = self.model;

            var widgetOptions = {
                isSource: spma.get('isSource'),
                onclickCallback : this.onclickCallback,
                mouseoutCallback: this.mouseoutCallback,
                mouseoverCallback: this.mouseoverCallback
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

