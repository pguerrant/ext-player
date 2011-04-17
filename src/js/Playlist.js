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

    constructor: function() {
        this.addEvents(
            /**
             * @event trackSelect
             * Fired when a track is selected
             * @param {Number} index
             */
            'trackSelect'
        );
        this.callParent(arguments);
    },

    // private
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            columns: [
                {header: 'Track', dataIndex: 'title'},
                {header: 'Artist', dataIndex: 'artist'}
            ],
            // setting selModel directly is not documented in Ext 4 Beta 2.
            // TODO: make sure this is the "right" way to do it
            selModel: Ext.create('Ext.selection.RowModel', {
                enableKeyNav: false,
                listeners: {
                    select: {
                        fn: me.onSelect,
                        scope: me
                    }
                }
            })
        });

        me.callParent(arguments);
    },

    /**
     * Move to the track at the given index
     * @param {Number} index
     */
    moveTo: function(index) {
        this.getSelectionModel().select(index);
    },

    /**
     * @private
     * Handles a select event on the selection model
     */
    onSelect: function(sm, record, index) {
        this.fireEvent('trackSelect', index);
    }

});