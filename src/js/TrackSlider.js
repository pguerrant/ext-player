/**
 * @class Xap.TrackSlider
 * @extends Ext.slider.Single


 * @constructor
 * Create a new volume slider
 * @param {Object} config The config object
 */

Ext.define('Xap.TrackSlider', {
    extend: 'Ext.slider.Single',
    alias: 'widget.xap.trackslider',

    animate: false,
    width: 290,
    value: 0,
    increment: 1,
    minValue: 0,
    maxValue: 0,
    cls: 'xap-trackslider',

    tipText: function(thumb) {
        return Xap.Format.formatTime(thumb.value);
    }

});