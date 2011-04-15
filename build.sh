# combine source files into player-debug.js
cat \
lib/ext/ext-all-debug.js \
lib/sm2/soundmanager2.js \
src/js/Format.js \
src/js/Format.js \
src/js/Templates.js \
src/js/TrackInfo.js \
src/js/TrackSlider.js \
src/js/VolumeSlider.js \
src/js/Track.js \
src/js/Playlist.js \
src/js/Player.js \
> build/player-debug.js

# compress player-debug.js to player.js
java -jar /opt/yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar build/player-debug.js -o build/player.js
