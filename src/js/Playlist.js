/**
 * @class Xap.Playlist
 * @extends Ext.grid.GridPanel

A playlist to be used with an {@link Xap.Player audio player}

 * @constructor
 * Create a new audio player
 * @param {Object} config The config object
 */
Ext.define('Xap.Playlist', {
    extend: 'Ext.grid.GridPanel',
    alias: 'widget.xap.playlist',


    height: 200,
    width: 300,
    border: 0,
    id: 'xap-playlist',

    // private
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            columns: [
                {header: 'Track', dataIndex: 'title'},
                {header: 'Artist', dataIndex: 'artist'}
            ]

        });

        me.callParent(arguments);
    }

});