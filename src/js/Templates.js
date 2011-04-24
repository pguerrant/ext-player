Ext.ns('Xap').Templates = {
    trackInfo: new Ext.XTemplate(
        '<p class="xap-time-elapsed">{position:this.formatPosition}</p>',
        '<div class="xap-id3">',
            '<p class="xap-artist">{artist:defaultValue("Unknown")}</p>',
            '<p class="xap-title">{title:defaultValue("Unknown")}</p>',
        '</div>',
        '<p class="xap-time-total">{duration:this.formatDuration}</p>',
        {
            formatPosition: function(value) {
                return Xap.Format.formatTime(value || 0);
            },
            formatDuration: function(value) {
                return value ? Xap.Format.formatTime(value) : '';
            }
        }
    )
};