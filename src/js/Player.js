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
     * @cfg {Boolean} lazy
     * If true, player will load just enough of each file in playlist to determine id3 info and track length and wait until track
     * is played to load the entire file. If false, player will load all files in playlist up front.
     * Lazy loading may result in a perceived performance improvement, although total download size will be greater, since player has to load
     * a portion of each file, then stop the download once meta info is retrieved, then when the file is played, redownload the entire file.
     * Defaults to true
     */
    lazy: true,

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

    /**
     * @cfg {Boolean} repeat
     * If true, player will continue to repeat the playlist until stopped by the user.
     * Defaults to false.
     */

    /**
     * @cfg {Object} playlistConfig
     * A playlist config object
     */

    /**
     * @cfg {Boolean} showPlaylist
     * True to show playlist at startup
     */

    height: 120,
    width: 300,
    cls: 'xap-player',
    layout: 'anchor',

    // private
    initComponent: function() {
        var me = this,
            trackInfo = new Xap.TrackInfo(),
            trackSlider = new Xap.TrackSlider({
                disabled: true,
                listeners: {
                    dragstart: {fn: me.onTrackSliderDragStart, scope: me},
                    changecomplete: {fn: me.onTrackSliderChangeComplete, scope: me}
                }
            });

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

    },

    // private
    initBottomBar: function() {
        var me = this,
            Button = Ext.button.Button,
            playlistButton = me.playlistButton = new Button({
                tooltip: 'Playlist',
                cls: 'xap-arrow-up',
                handler: me.togglePlaylist,
                scope: me
            }),
            playButton = me.playButton = new Button({
                tooltip: 'Play|Pause',
                cls: 'xap-play',
                handler: me.togglePause,
                scope: me
            }),
            muteButton = me.muteButton = new Button({
                tooltip: 'Mute|Unmute',
                cls: 'xap-unmuted',
                handler: me.toggleMute,
                scope: me
            }),
            prevButton = me.prevButton = new Button({
                tooltip: 'Previous',
                cls: 'xap-prev',
                handler: me.movePrev,
                scope: me
            }),
            nextButton = me.nextButton = new Button({
                tooltip: 'Next',
                cls: 'xap-next',
                handler: me.moveNext,
                scope: me
            }),
            volumeChangeHandler = me.onVolumeSliderChange,
            volumeSlider = me.volumeSlider = new Xap.VolumeSlider({
                value: me.volume,
                disabled: true,
                listeners: {
                    drag: {fn: volumeChangeHandler, scope: me},
                    changecomplete: {fn: volumeChangeHandler, scope: me}
                }
            }),
            spacer = function(width) {
                return {xtype: 'tbspacer', width: width};
            };

        return [
            spacer(4),
            playlistButton,
            spacer(93),
            prevButton,
            spacer(3),
            playButton,
            spacer(3),
            nextButton,
            '->',
            muteButton,
            volumeSlider,
            spacer(5)
        ];
    },

    // private
    afterRender: function() {
        var me = this,
            el = me.getEl(),
            playlist = me.playlist = Ext.create('Xap.Playlist',
                Ext.apply(me.playlistConfig || {}, {
                    store: me.store,
                    listeners: {
                        trackSelect: {
                            fn: me.moveTo,
                            scope: me
                        }
                    },
                    renderTo: el.parent()
                })
            );

        me.callParent(arguments);
        if(!me.showPlaylist) {
            me.togglePlaylist();
        }
        // for floating mode
        playlist.alignTo(el, 'tl-bl');

        if(me.files) {
            if(me.autoPlay) {
                me.loadAndPlay(me.files);
            } else {
                me.load(me.files);
            }
        }

    },

    /**
     * Loads an array of files into the player and automatically begins playing the first one.
     * @param {Array} files An array of file urls
     */
    loadAndPlay: function(files) {
        var me = this,
            trackCount = me.store.getCount();
        me.load(files);
        // setting current track index here since the call to "load" sets it to the first track
        // in the playlist, when what we want is the first track in the files array that was passed in.
        //me.currentTrackIndex = trackCount;
        me.moveTo(trackCount);
        me.play();
    },

    /**
     * Loads an array of files into the player.
     * @param {Array} files An array of file urls
     */
    load: function(files) {
        var me = this;

        Ext.Array.forEach(files, function(url) {
            // create a SoundManager Sound object and add it to the store
            var smSound = me.createSmSound(url, true);
            smSound.load();
            me.store.add({url: url, smSound: smSound});
        });
        // Set the current track to the first track in the store, unless, of course we already have a current track.
        // This allows you to call "load" repeatedly to add additional files without changing the file that is currently being played
        if(!Ext.isNumber(me.currentTrackIndex)) {
            me.moveTo(0);
        }
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
            index;

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
        index = me.getTrackIndexById(files);
        if(index === me.currentTrackIndex) {
            // if we're unloading the current track lets move to the next track before we destroy the current one
            me.moveNext();
            // decrement the current index since the track we just moved to will now be the current track
            // unless, of course we looped around to the first track when we called moveNext
            me.currentTrackIndex = Math.min(me.currentTrackIndex - 1, 0);
        }
        if(index < me.currentTrackIndex) {
            // if the track we are unloading is before the current track, we need to decrement the currentTrackIndex
            me.currentTrackIndex --;
        }
        // destroy the sm2 sound object
        store.getAt(index).get('smSound').destruct();
        // remove the track from the store
        store.removeAt(index);
        if(store.getCount() === 0) {
            // disable the sliders if our playlist is empty, since they're useless without a current track
            this.trackSlider.disable();
            this.volumeSlider.disable();
        }
    },

    /**
     * Pauses/resumes play of current track
     */
    togglePause: function() {
        var smSound = this.getCurrentSmSound();
        if(smSound) {
            if(smSound.playState === 0 || smSound.paused) {
                this.play();
            } else {
                this.pause();
            }
        }
    },

    /**
     * Pauses the currently playing track
     */
    pause: function() {
        var smSound = this.getCurrentSmSound();
        if(smSound) {
            smSound.pause();
            this.playButton.removeCls('xap-pause');
            this.playButton.addCls('xap-play');
        }
    },

    /**
     * Plays the current track
     */
    play: function() {
        var smSound = this.getCurrentSmSound();
        if(smSound) {
            smSound.play();
            this.playButton.removeCls('xap-play');
            this.playButton.addCls('xap-pause');
        }
    },

    /**
     * Stops the current track
     */
    stop: function() {
        var smSound = this.getCurrentSmSound();
        if(smSound) {
            smSound.stop();
        }
    },

    /**
     * Mutes the current track
     */
    mute: function() {
        this.getCurrentSmSound().mute();
        this.muteButton.removeCls('xap-unmuted');
        this.muteButton.addCls('xap-muted');
        this.volumeSlider.setValue(0);
    },

    /**
     * Unmutes the current track
     */
    unmute: function() {
        var me = this,
            smSound = me.getCurrentSmSound();
        me.getCurrentSmSound().unmute();
        me.muteButton.removeCls('xap-muted');
        me.muteButton.addCls('xap-unmuted');
        me.volumeSlider.setValue(smSound.volume);
    },

    /**
     * Toggles track between muted and unmuted
     */
    toggleMute: function() {
        if(this.getCurrentSmSound().muted) {
            this.unmute();
        } else {
            this.mute();
        }
    },

    /**
     * Moves to the previous track in the playlist.  If we are currently on the first track, and {@link #repeat}
     * is true, then moves to the last track.  The current play state stays the same.
     * @return {Boolean} true if successful
     */
    movePrev: function() {
        var me = this,
            currentTrackIndex = me.currentTrackIndex;

        if(currentTrackIndex === 0) {
            if(me.repeat) {
                me.moveTo(me.store.getCount() - 1);
            } else {
                return false;
            }
        } else {
            me.moveTo(currentTrackIndex - 1);
        }
        return true;
    },

    /**
     * Moves to the next track in the playlist.  If we are currently on the last track, and {@link #repeat}
     * is true, then moves to the first track.  The current play state stays the same.
     * @return {Boolean} true if successful
     */
    moveNext: function() {
        var me = this,
            currentTrackIndex = me.currentTrackIndex;

        if(currentTrackIndex === me.store.getCount() - 1) {
            if(me.repeat) {
                me.moveTo(0);
            } else {
                return false;
            }
        } else {
            me.moveTo(currentTrackIndex + 1);
        }
        return true;
    },

    /**
     * Moves to the track at a given index. The current play state stays the same.
     * @param {Number} index
     */
    moveTo: function(index) {
        var me = this,
            smSound = me.getCurrentSmSound(),
            isPlaying = smSound && (smSound.playState === 1 && !smSound.paused),
            isMuted = smSound && (smSound.muted),
            prevButton = me.prevButton,
            nextButton = me.nextButton;

        me.stop();
        me.currentTrackIndex = index;
        smSound = me.getCurrentSmSound();  // get the smSound at the new index
        smSound.load();
        me.updateTrackPosition(0);
        me.updateTrackInfoDisplay();
        if(smSound.loaded) {
            me.setTrackDuration(smSound, true);
        } else {
            me.setTrackDuration(smSound);
        }
        // when playing a new track volume defaults to 100, so we need to set it to the value of the volume slider
        me.onVolumeSliderChange(me.volumeSlider);
        if(!me.repeat) {
            // if we're not in repeat mode disable the prev button if current track is the first, or next button if it is the last
            if(index === 0) {
                prevButton.disable();
                nextButton.enable();
            } else if(index === me.store.getCount() - 1) {
                nextButton.disable();
                prevButton.enable();
            } else {
                prevButton.enable();
                nextButton.enable();
            }
        }
        if(isMuted) {
            me.mute();
        }
        if(isPlaying) {
           me.play();
        }
        me.playlist.moveTo(index);
    },

    // private
    createSmSound: function(url) {
        var me = this,
            bind = function(fn) {
                // sm2 event handlers are scoped to the sm2 sound object by default and have no args.
                // this changes the scope to the current "Player" instance and passes the sm2 sound as the 1st arg
                return function() {
                    fn.call(me, this);
                };
            };

        return soundManager.createSound({
            id: url,
            url: url,
            onload: bind(me.onLoad),
            onid3: bind(me.onId3),
            whileloading: bind(me.onWhileLoading),
            whileplaying: bind(me.onWhilePlaying),
            onfinish: bind(me.onTrackFinish)
        });
    },

    // private
    updateTrackInfoDisplay: function() {
        this.trackInfo.set(this.getId3Info(this.getCurrentSmSound()));
    },

    // private
    getId3Info: function(smSound) {
        var info = smSound.id3;
        return {
            artist: info.TPE1,
            title: info.TIT2,
            album: info.TALB
        };
    },

    // private
    onId3: function(smSound) {
        // save the id3 info to the record in the store
        var record = this.getTrackById(smSound.sID);
        record.set(this.getId3Info(smSound));
        record.commit();
        if(this.isCurrentSmSound(smSound)) {
            this.updateTrackInfoDisplay();
        } else if(this.lazy) {
            // if running in lazy loading mode, unlaod the track once we have the id3 info.
            // the track will reload when it is played
            smSound.unload();
        }
    },

    // private
    onWhileLoading: function(smSound) {
        this.setTrackDuration(smSound);
    },

    // private
    onLoad: function(smSound) {
        this.setTrackDuration(smSound, true);
    },

    // private
    setTrackDuration: function(smSound, isFinal) {
        // in Sound Manager 2 durationEstiamte can be NaN, so fallback to zero if we don't have a duration estimate
        var duration = isFinal ? smSound.duration : smSound.durationEstimate || 0,
            record = this.getTrackById(smSound.sID);

        record.set({duration: duration});
        record.commit();
        if(this.isCurrentSmSound(smSound)) {
            this.updateTrackDurationDisplay(duration);
        }
    },

    // private
    updateTrackDurationDisplay: function(duration) {
        this.trackInfo.set({timeTotal: duration});
        this.trackSlider.setMaxValue(duration);
    },

    // private
    updateTrackPosition: function(position) {
        if(!Ext.isNumber(position)) {
            position = this.getCurrentSmSound().position;
        }
        if(!this.isSliderDragging) {
            this.trackInfo.set({timeElapsed: position});
            this.trackSlider.setValue(position);
        }
    },

    // private
    onWhilePlaying: function(smSound) {
        this.updateTrackPosition();
    },

    // private
    onTrackSliderDragStart: function(slider, e) {
        this.isSliderDragging = true;
    },

    // private
    onTrackSliderChangeComplete: function(slider) {
        this.isSliderDragging = false;
        this.getCurrentSmSound().setPosition(slider.getValue());
    },

    // private
    onVolumeSliderChange: function(slider) {
        var smSound = this.getCurrentSmSound();
        smSound.setVolume(slider.getValue());
        this.unmute();
    },

    // private
    onTrackFinish: function(smSound) {
        var me = this;
        if(me.moveNext()) {
            me.play();
        } else {
            me.moveTo(0);
            me.playButton.removeCls('xap-pause');
            me.playButton.addCls('xap-play');
        }
    },

    // private
    disableSlider: function(slider) {
        // TODO: move disabling of sliders to initial config once the slider bug is fixed
        // Won't need to check for current track if we use initial config
        if(!this.getCurrentSmSound()) {
            slider.disable();
        }
    },

    // private
    getCurrentSmSound: function() {
        var currentTrack = this.store.getAt(this.currentTrackIndex);
        return currentTrack ? currentTrack.get('smSound') : null;
    },

    // private
    isCurrentSmSound: function(smSound) {
        return smSound === this.getCurrentSmSound();
    },

    // private
    getTrackById: function(id) {
        return this.store.findRecord('url', id, 0, false, true, true);
    },

    // private
    getTrackIndexById: function(id) {
        return this.store.find('url', id, 0, false, true, true);
    },

    // private
    togglePlaylist: function() {
        var me = this,
            playlist = me.playlist,
            playlistButton = me.playlistButton;

        if(playlist.isHidden()) {
            playlist.show();
            playlistButton.removeCls('xap-arrow-down');
            playlistButton.addCls('xap-arrow-up');
        } else {
            playlist.hide();
            playlistButton.removeCls('xap-arrow-up');
            playlistButton.addCls('xap-arrow-down');
        }
    }

});
