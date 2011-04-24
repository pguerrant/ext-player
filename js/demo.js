soundManager.url = 'swf';
soundManager.debugMode = false;
soundManager.useHTML5Audio = true

Ext.require('Xap.Player');
soundManager.onready(function() {

    var player = Ext.create('Xap.Player', {
        xtype: 'xap.player',
        //draggable: true,
        files: [
            'audio_files/If I Could Fly.mp3',
            'audio_files/Big Country.mp3', // a song with a pretty long artist name
            'audio_files/BaytovenGoesCrazy.mp3',
            'audio_files/Prelude From Suite No. 1 In G Major For Cello Bwv 1007.mp3', // a song with a really long title
            'audio_files/41.mp3' // a song with a really short title
        ],
        playlistConfig: {
            showTime: true,
            showAlbum: true,
            width: 500
            //floating: true
        },
        showPlaylist: true
        //autoPlay: true
    }),
    playerWindow = Ext.create('Xap.Window', {
        id: 'player-window',
        constrain: true,
        resizable: false,
        width: 300,
        height: 121,
        draggable: {
            delegate: '.xap-player',
            delegateExcludes: '.x-btn, .x-form-item'
        },
        preventHeader: true,
        frame: false,
        shadow: false,
        liveDrag: true,
        items: [player]
    });

    Ext.create('Ext.container.Viewport', {
        layout: 'fit',
        items: [{
            xtype: 'tabpanel',
            items: [
                {
                    title: 'Demo',
                    id: 'demo-tab',
                    items: [playerWindow]
                }
            ]
        }]
    });

    playerWindow.setPosition(50, 50);
    playerWindow.show();

});


/**
 *  A window that allow's configuration of its {@link Ext.util.ComponentDragger}. This allows the
 *  developer to configure the way in which the window will be dragged, most notably the delegate.
 *  {@link Ext.window.Window} uses it's header as the delegate (element that is clicked to drag the window).
 */
Ext.define('Xap.Window', {
    extend: 'Ext.window.Window',

    /**
     * @cfg {Boolean|Object} draggable
     * <p>True to allow the window to be dragged be the header bar, or a config object for {@link Ext.util.ComponentDragger}
     * false to disable dragging (defaults to true),
     * that by default the window will be centered in the viewport, so if dragging is disabled the window may need
     * to be positioned programmatically after render (e.g., myWindow.setPosition(100, 100);).<p>
     */
    draggable: true,

    /**
     * @private
     * @override
     * Override Window.initDraggable.
     * Window uses the header element as the delegate.  Overriding to allow
     * the developer to configure the delegate in the {@link #draggable} config.
     */
    initDraggable: function() {
        var me = this,
            ddConfig;

        if (!me.header) {
            me.updateHeader(true);
        }

        ddConfig = Ext.applyIf({
            el: me.el
        }, me.draggable);

        if(me.header) {
            Ext.applyIf(ddConfig, {delegate: '#' + me.header.id});
        }


        // Add extra configs if Window is specified to be constrained
        if (me.constrain || me.constrainHeader) {
            ddConfig.constrain = me.constrain;
            ddConfig.constrainDelegate = me.constrainHeader;
            ddConfig.constrainTo = me.constrainTo || me.container;
        }

        /**
         * <p>If this Window is configured {@link #draggable}, this property will contain
         * an instance of {@link Ext.util.ComponentDragger} (A subclass of {@link Ext.dd.DragTracker DragTracker})
         * which handles dragging the Window's DOM Element, and constraining according to the {@link #constrain}
         * and {@link #constrainHeader} .</p>
         * <p>This has implementations of <code>onBeforeStart</code>, <code>onDrag</code> and <code>onEnd</code>
         * which perform the dragging action. If extra logic is needed at these points, use
         * {@link Ext.Function#createInterceptor createInterceptor} or {@link Ext.Function#createSequence createSequence} to
         * augment the existing implementations.</p>
         * @type Ext.util.ComponentDragger
         * @property dd
         */
        me.dd = Ext.create('Xap.ComponentDragger', this, ddConfig);
        me.relayEvents(me.dd, ['dragstart', 'drag', 'dragend']);
    }


});


/**
 * A component dragger that allows you to configure a delegate element for dragging,
 * while excluding certain child nodes of that delegate
 * @class Xap.ComponentDragger
 * @extends Ext.util.ComponentDragger
 * @constructor
 */
Ext.define('Xap.ComponentDragger', {
    extend: 'Ext.util.ComponentDragger',


    /**
     * @cfg {String} delegateExcludes
     * Optional. <p>A {@link Ext.DomQuery DomQuery} selector which identifies child elements within of the delegate(s)
     * that will not be tracked
     */

    /**
     * @override
     * Overrides onMouseDown to check delegateExcludes first
     */
    onMouseDown: function(e, target) {
        var me = this,
            delegateExcludes = me.delegateExcludes,
            el = e.getTarget(),
            excludes;

        if(delegateExcludes) {
            excludes = Ext.DomQuery.jsSelect(delegateExcludes, target);
            while(el && el !== target) {
                if(Ext.Array.contains(excludes, el)) {
                    return;
                }
                el = el.parentNode;
            }
        }
        me.callParent(arguments);
    }

});