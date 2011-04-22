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

    /**
     * @cfg {Boolean} showArtist
     * True to show the artist column. Defaults to true
     */
    showArtist: true,

    /**
     * @cfg {Boolean} showTime
     * True to show the time column.  Defaults to false
     */

    /**
     * @cfg {Boolean} showAlbum
     * True to show the album column. Defaults to false
     */

    /**
     * @cfg {Number} height
     * The height of the playlist in pixels. Defaults to 200.
     */
    height: 200,

    /**
     * @cfg {Number} width
     * The width of the playlist in pixels. Defaults to 300.
     */
    width: 300,

    border: 0,
    cls: 'xap-playlist',
    sortableHeaders: false,

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
        var me = this,
            columns = [
                {header: 'Track', dataIndex: 'title', flex: 1, menuDisabled: true}
            ];

        if(me.showArtist) {
            columns.push({header: 'Artist', dataIndex: 'artist', flex: 1, menuDisabled: true});
        }
        if(me.showTime) {
            columns.push({header: 'Time', dataIndex: 'duration', renderer: me.renderTime, width: 35, menuDisabled: true});
        }
        if(me.showAlbum) {
            columns.push({header: 'Album', dataIndex: 'album', flex: 1, menuDisabled: true});
        }

        Ext.apply(me, {
            columns: columns,
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
    },

    /**
     * @private
     * renderer for time column
     */
    renderTime: function(value) {
        return value ? Xap.Format.formatTime(value) : '';
    }

});