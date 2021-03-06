/**
 * @class Xap.TrackInfo
 * @extends Ext.panel.Panel

A panel that displays id3 info about an audio track, as well as track length and position info.

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

    height: 54,

    tpl: Xap.Templates.trackInfo,
    cls: 'xap-trackinfo',

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