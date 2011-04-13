/**
 * @class Xap.TrackInfo
 * @extends Ext.panel.Panel

A panel that displays info about an audio track

 * @constructor
 * Create a new track info panel
 * @param {Object} config The config object
 */

Ext.define('Xap.TrackInfo', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.xap.trackinfo',
    requires: [
        'Xap.Templates'
    ],

    height: 55,

    tpl: Xap.Templates.trackInfo,

    // private
    initComponent: function() {
        this.info = {};
        this.callParent(arguments);
    },

    /**
     * Sets track info and updates the display
     * @param {Object} info An object with track info properties
     */
    set: function(info) {
        this.update(Ext.apply(this.info, info));
    },

    /**
     * Clears the track info from the panel
     */
    clear: function() {
        (new Ext.core.Element(this.body)).update("");
    }


});