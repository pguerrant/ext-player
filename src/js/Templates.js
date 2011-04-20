Ext.ns('Xap').Templates = {
    trackInfo: new Ext.XTemplate(
        '<p class="xap-time-elapsed">{timeElapsed:this.formatTimeElapsed}</p>',
        '<p class="xap-artist">{artist:defaultValue("Unknown")}</p>',
        '<p class="xap-title">{title:defaultValue("Unknown")}</p>',
        '<p class="xap-time-total">{timeTotal:this.formatTimeTotal}</p>',
        {
            formatTimeElapsed: function(value) {
                return Xap.Format.formatTime(value || 0);
            },
            formatTimeTotal: function(value) {
                return value ? Xap.Format.formatTime(value) : '';
            }
        }
    )
};