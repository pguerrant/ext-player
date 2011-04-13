/**
 * @class Xap.Format
 * Formatting utilites used in Ext Audio Player
 * @singleton
 */
Ext.ns('Xap').Format = {
    /**
     * Fomats a millisecond value as minutes and seconds separated by a colon
     * @param {Number} value
     * @return {String} The formatted value
     */
    formatTime: function(value) {
        var s = value / 1000,
            minutes = Math.floor(s / 60),
            seconds = Math.floor(s % 60);
        return Ext.String.format('{0}:{1}', minutes, seconds < 10 ? '0' + seconds : seconds);
    }
};