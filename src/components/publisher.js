var startPublish = function() {
    $('#rtc_media_player').show();

    // Close PC when user replay.
    if (sdk) {
        sdk.close();
    }
    sdk = new SrsRtcPublisherAsync();

    // User should set the stream when publish is done, @see https://webrtc.org/getting-started/media-devices
    // However SRS SDK provides a consist API like https://webrtc.org/getting-started/remote-streams
    $('#rtc_media_player').prop('srcObject', sdk.stream);
    // Optional callback, SDK will add track to stream.
    // sdk.ontrack = function (event) { console.log('Got track', event); sdk.stream.addTrack(event.track); };

    // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/WebRTC_codecs#getting_the_supported_codecs
    sdk.pc.onicegatheringstatechange = function (event) {
        if (sdk.pc.iceGatheringState === "complete") {
            $('#acodecs').html(SrsRtcFormatSenders(sdk.pc.getSenders(), "audio"));
            $('#vcodecs').html(SrsRtcFormatSenders(sdk.pc.getSenders(), "video"));
        }
    };

    // For example: webrtc://r.ossrs.net/live/livestream
    var url = $("#txt_url").val();
    sdk.publish(url).then(function(session){
        $('#sessionid').html(session.sessionid);
        $('#simulator-drop').attr('href', session.simulator + '?drop=1&username=' + session.sessionid);
    }).catch(function (reason) {
        // Throw by sdk.
        if (reason instanceof SrsError) {
            if (reason.name === 'HttpsRequiredError') {
                alert(`WebRTC推流必须是HTTPS或者localhost：${reason.name} ${reason.message}`);
            } else {
                alert(`${reason.name} ${reason.message}`);
            }
        }
        // See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#exceptions
        if (reason instanceof DOMException) {
            if (reason.name === 'NotFoundError') {
                alert(`找不到麦克风和摄像头设备：getUserMedia ${reason.name} ${reason.message}`);
            } else if (reason.name === 'NotAllowedError') {
                alert(`你禁止了网页访问摄像头和麦克风：getUserMedia ${reason.name} ${reason.message}`);
            } else if (['AbortError', 'NotAllowedError', 'NotFoundError', 'NotReadableError', 'OverconstrainedError', 'SecurityError', 'TypeError'].includes(reason.name)) {
                alert(`getUserMedia ${reason.name} ${reason.message}`);
            }
        }

        sdk.close();
        $('#rtc_media_player').hide();
        console.error(reason);
    });
};
export {startPublish};