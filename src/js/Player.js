/**
 * @class Xap.Player
 * @extends Ext.panel.Panel

An audio player

 * @constructor
 * Create a new audio player
 * @param {Object} config The config object
 */
Ext.define('Xap.Player', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.xap.player',
    requires: [
        'Xap.TrackInfo',
        'Xap.TrackSlider',
        'Xap.VolumeSlider',
        'Xap.Playlist'
    ],

    /**
     * @cfg {Number} volume
     * A number from 0 to 100 to use as the audio player's initial volume setting. Defaults to 75.
     * This property will be modified after initialization as the volume is changed using the volume slider
     */
    volume: 75,

    /**
     * @cfg {Boolean} lazyLoad
     * If true, player will load just enough of each file in playlist to determine id3 info and track length and wait until track
     * is played to load the entire file. If false, player will load all files in playlist up front.
     * Lazy loading may result in a perceived performance improvement, although total download size will be greater, since player has to load
     * a portion of each file, then stop the download once meta info is retrieved, then when the file is played, redownload the entire file.
     * Defaults to true
     */
    lazyLoad: true,

    /**
     * @cfg {Array} files
     * An optional array of file urls to initially load into the player.
     * After initialization files can be loaded using the {@link #load} method.
     */

    /**
     * @cfg {Boolean} autoPlay
     * If true, and the player has been configured with {@link #files}, then the first file will begin playing
     * automatically when the player is initialized. Defaults to false.
     */

    height: 120,
    width: 300,
    id: 'xap-player',
    layout: 'anchor',

    // private
    initComponent: function() {
        var me = this,
            trackInfo = new Xap.TrackInfo(),
            trackSlider = new Xap.TrackSlider();

        Ext.apply(me, {
            trackInfo: trackInfo,
            trackSlider: trackSlider,
            store: new Ext.data.Store({
                model: 'Track'
            }),
            items: [
                trackInfo,
                trackSlider
            ],
            bbar: me.initBottomBar()
        });
        me.callParent(arguments);

        // disabling the track slider on render since the "disabled" configuration
        // doesn't work on sliders as of Ext JS 4 Beta 2  4/10/2011
        // http://www.sencha.com/forum/showthread.php?130022-Ext.slider.Single-throws-an-error-when-initialized-with-quot-disabled-quot-configuration&p=590568#post590568
        // TODO: move this to initial config when this is fixed.
        trackSlider.on('render', me.disableSlider, me);
        trackSlider.on('dragstart', me.onTrackSliderDragStart, me);
        trackSlider.on('changecomplete', me.onTrackSliderChangeComplete, me);

        if(me.files) {
            me.autoPlay ? me.loadAndPlay(me.files) : me.load(me.files);
        }

    },

    // private
    initBottomBar: function() {
        var me = this,
            Button = Ext.button.Button,
            volumeSlider = this.volumeSlider = new Xap.VolumeSlider();

        // disabling the volume slider on render since the "disabled" configuration
        // doesn't work on sliders as of Ext JS 4 Beta 2  4/10/2011
        // http://www.sencha.com/forum/showthread.php?130022-Ext.slider.Single-throws-an-error-when-initialized-with-quot-disabled-quot-configuration&p=590568#post590568
        // TODO: move this to initial config when this is fixed.
        volumeSlider.on('render', me.disableSlider, me);
        me.playButton = new Button({
            tooltip: 'Play|Pause',
            iconCls: 'xap-play',
            handler: me.togglePause,
            scope: me
        });
        me.muteButton = new Button({
            tooltip: 'Mute|Unmute',
            iconCls: 'xap-unmuted',
            handler: me.toggleMute,
            scope: me
        })
        return [
            {
                tooltip: 'Previous',
                iconCls: 'xap-prev',
                handler: me.playPrev,
                scope: me
            },
            me.playButton,
            {
                tooltip: 'Next',
                iconCls: 'xap-next',
                handler: me.playNext,
                scope: me
            },
            me.muteButton,
            volumeSlider
        ];
    },

    /**
     * Loads an array of files into the player and automatically begins playing the first one.
     * @param {Array} files An array of file urls
     */
    loadAndPlay: function(files) {
        this.load(files);
        // setting current track here since the call to "load" sets it to the first track
        // in the playlist, when what we want is the first track in the files array that was passed in.
        this.currentTrack = soundManager.getSoundById(files[0]);
        this.play();
    },

    /**
     * Loads an array of files into the player.
     * @param {Array} files An array of file urls
     */
    load: function(files) {
        var me = this,
            bind = Ext.Function.bind;

        Ext.Array.forEach(files, function(url) {
            // create a SoundManager Sound object and add it to the store
            var smSound = soundManager.createSound({
                id: url,
                url: url,
                onload: bind(me.updateTrackLengthFinal, me),
                whileloading: bind(me.updateTrackLengthEstimate, me),
                whileplaying: bind(me.updateTrackPosition, me),
                onid3: bind(me.updateTrackInfo, me),
                onfinish: bind(me.onTrackFinish, me)
            });
            me.store.add({url: url, smSound: smSound});
        });
        // Set the current track to the first track in the store, unless, of course we already have a current track.
        // This allows you to call "load" repeatedly to add additional files without changing the file that is currently being played
        me.currentTrack = me.currentTrack || me.store.getAt(0).get('smSound');
        // enable sliders
        me.trackSlider.enable();
        me.volumeSlider.enable();
    },

    /**
     * Unloads files from the player.
     * @param {Array|String} files An optional array of files to unload, or a single file url.
     * If undefined, all files will be unloaded.
     * If the file or files in the array does not exist in the player's store it will fail silently.
     */
    unload: function(files) {
        var me = this,
            store = me.store,
            record, index, smSound;

        if(!files) {
            // if no files were passed, remove all tracks in the store by calling unload recursively
            store.each(function(track) {
                me.unload(track.get('url'));
            });
        }
        if(Ext.isArray(files)) {
            // if files is an array remove tracks by calling unload recursively on all the urls in the array
            Ext.Array.forEach(files, function(file) {
                me.unload(file);
            });
        }
        // if we got here "files" is a string referring to a single file url
        record = store.findRecord('url', files, 0, false, true, true);
        index = store.indexOf(record);
        smSound = record.get('smSound');
        if(smSound === me.currentTrack) {
            // special handling if we unloaded the current track:
            // if current track is last in the playlist, then use the one before it as the current track
            // otherwise use the one after"
            me.currentTrack = (record === store.last())
                ? store.getAt(index - 1).get('smSound')
                : store.getAt(index + 1).get('smSound');
            me.updateTrackInfo();
            // if the old current track was playing when we removed it, then start playing the new current track immediately.
            // unless of course we removed the last track in the playlist, then there's nothing after it to play
            if(smSound.playState === 1 && !smSound.paused && record !== store.last()) {
                me.currentTrack.play();
            }
        }
        // destroy the sm2 sound object
        smSound.destruct();
        // remove the track from the store
        store.remove(record);
        if(store.getCount() === 0) {
            // disable the sliders if our playlist is empty, since they're useless without a current track
            //this.trackSlider.disable();
            this.volumeSlider.disable();
        }
    },

    /**
     * Pauses/resumes play of current track
     */
    togglePause: function() {
        var currentTrack = this.currentTrack;
        if(currentTrack) {
            (currentTrack.playState === 0 || currentTrack.paused) ? this.play() : this.pause();
        }
    },

    /**
     * Pauses the currently playing track
     */
    pause: function() {
        var currentTrack = this.currentTrack;
        if(currentTrack) {
            currentTrack.pause();
            this.playButton.setIconClass('xap-play');
        }
    },

    /**
     * Plays the current track
     */
    play: function() {
        var currentTrack = this.currentTrack;
        if(currentTrack) {
            currentTrack.play();
            this.playButton.setIconClass('xap-pause');
        }
    },

    /**
     * Toggles track between muted and unmuted
     */
    toggleMute: function() {
        var currentTrack = this.currentTrack;
        currentTrack.toggleMute();
        this.muteButton.setIconClass(currentTrack.muted ? 'xap-muted' : 'xap-unmuted');
    },

    // private
    updateTrackInfo: function() {
        var info = this.currentTrack.id3;
        this.trackInfo.set({
            artist: info.TPE1,
            title: info.TIT2
        });
    },

    // private
    updateTrackLengthEstimate: function() {
        this.updateTrackLength(this.currentTrack.durationEstimate);
    },

    // private
    updateTrackLengthFinal: function() {
        this.updateTrackLength(this.currentTrack.duration);
    },

    // private
    updateTrackLength: function(duration) {
        this.trackInfo.set({timeTotal: duration});
        this.trackSlider.setMaxValue(duration);
    },

    // private
    updateTrackPosition: function() {
        var position = this.currentTrack.position;
        if(!this.isSliderDragging) {
            this.trackInfo.set({timeElapsed: position});
            this.trackSlider.setValue(position);
        }
    },

    // private
    onTrackSliderDragStart: function(slider, e) {
        this.isSliderDragging = true;
    },

    // private
    onTrackSliderChangeComplete: function(slider) {
        this.isSliderDragging = false;
        this.currentTrack.setPosition(slider.getValue());
    },

    // private
    onTrackFinish: function() {
        this.playButton.setIconClass('xap-play');
    },

    // private
    disableSlider: function(slider) {
        // TODO: move disabling of sliders to initial config once the slider bug is fixed
        // Won't need to check for current track if we use initial config
        if(!this.currentTrack) {
            slider.disable();
        }
    }

});
