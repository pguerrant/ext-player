/**
 * @class Xap.VolumeSlider
 * @extends Ext.slider.Single


 * @constructor
 * Create a new volume slider
 * @param {Object} config The config object
 */
Ext.define('Xap.VolumeSlider', {
    extend: 'Ext.slider.Single',
    alias: 'widget.xap.volumeslider',

    animate: false,
    width: 65,
    value: 0,
    increment: 1,
    minValue: 0,
    maxValue: 100,
    tipText: function(thumb) {
        return thumb.value + '%';
    }
});
