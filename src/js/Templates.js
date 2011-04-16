Ext.ns('Xap').Templates = {
    trackInfo: new Ext.XTemplate(
        '<p class="xap-time-elapsed">{timeElapsed:this.formatTime}</p>',
        '<p class="xap-artist">{artist:defaultValue("Unknown")}</p>',
        '<p class="xap-title">{title:defaultValue("Unknown")}</p>',
        '<p class="xap-time-total">{timeTotal:this.formatTime}</p>',
        {
            formatTime: function(value) {
                return Xap.Format.formatTime(value || 0);
            }
        }
    )
};