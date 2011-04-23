soundManager.url = 'swf';
soundManager.debugMode = false;
soundManager.useHTML5Audio = true

Ext.require('Xap.Player');
soundManager.onready(function() {


    Ext.create('Xap.Player', {
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
        showPlaylist: true,
        //autoPlay: true,
        renderTo: Ext.getBody()
    });
});

