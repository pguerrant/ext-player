soundManager.url = 'swf';
soundManager.debugMode = false;
soundManager.useHTML5Audio = true

Ext.require('Xap.Player');
soundManager.onready(function() {

    var files = [
        'audio_files/Guarja.mp3',
        'audio_files/20 Years.mp3',
        'audio_files/Velcro.mp3',
        'audio_files/No Answers.mp3',
        'audio_files/Down In The Valley.mp3',
        'audio_files/Bluesy Basie.mp3',
        'audio_files/Deep Air.mp3',
        'audio_files/Rhythmaron.mp3',
        'audio_files/Africa Land.mp3'
    ],
    player = Ext.create('Xap.Player', {
        files: files,
        playlistConfig: {
            showTime: true,
            showAlbum: true,
            width: 500
        },
        showPlaylist: true
    }),
    playerWindow = Ext.create('Xap.Window', {
        id: 'player-window',
        constrain: true,
        resizable: false,
        width: 300,
        height: 119,
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
            id: 'demo-panel',
            items: [playerWindow]
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
