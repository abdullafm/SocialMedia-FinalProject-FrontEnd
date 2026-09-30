(function () {
    var micBtn = document.getElementById("call-mic");
    var camBtn = document.getElementById("call-cam");
    var screenBtn = document.getElementById("call-screen");
    var hangupBtn = document.getElementById("call-hangup");
    var stage = document.getElementById("call-stage");
    var muteBadge = document.getElementById("call-mute");
    var camVideo = document.getElementById("call-cam-video");
    var screenVideo = document.getElementById("call-screen-video");
    if (!micBtn || !camBtn || !screenBtn || !stage || !camVideo || !screenVideo) return;

    function paintMic(muted) {
        micBtn.classList.toggle("is-off", muted);
        micBtn.setAttribute("aria-pressed", muted ? "true" : "false");
        micBtn.querySelector("i").className = muted ? "fa-solid fa-microphone-slash" : "fa-solid fa-microphone";
        muteBadge.classList.toggle("is-gone", !muted);
    }

    var camStream = null;

    function stopCam() {
        if (!camStream) return;
        camStream.getTracks().forEach(function (track) { track.stop(); });
        camStream = null;
        camVideo.srcObject = null;
    }

    function paintCam(on) {
        camBtn.classList.toggle("is-off", !on);
        camBtn.setAttribute("aria-pressed", on ? "false" : "true");
        camBtn.querySelector("i").className = on ? "fa-solid fa-video" : "fa-solid fa-video-slash";
        camVideo.hidden = false;
        stage.classList.toggle("has-cam", on);
        stage.classList.toggle("has-media", on || stage.classList.contains("has-screen"));
        if (!on) {
            stopCam();
            return;
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(function (stream) {
            if (!stage.classList.contains("has-cam")) {
                stream.getTracks().forEach(function (track) { track.stop(); });
                return;
            }
            stopCam();
            camStream = stream;
            camVideo.srcObject = stream;
        }).catch(function () {
            camBtn.classList.add("is-off");
            camBtn.setAttribute("aria-pressed", "true");
            camBtn.querySelector("i").className = "fa-solid fa-video-slash";
            stage.classList.remove("has-cam");
            stage.classList.toggle("has-media", stage.classList.contains("has-screen"));
        });
    }

    function paintScreen(on) {
        screenBtn.classList.toggle("is-on", on);
        screenBtn.setAttribute("aria-pressed", on ? "true" : "false");
        screenVideo.hidden = false;
        stage.classList.toggle("has-screen", on);
        stage.classList.toggle("has-media", on || stage.classList.contains("has-cam"));
    }

    micBtn.addEventListener("click", function () {
        paintMic(!micBtn.classList.contains("is-off"));
    });

    camBtn.addEventListener("click", function () {
        paintCam(camBtn.classList.contains("is-off"));
    });

    screenBtn.addEventListener("click", function () {
        paintScreen(!screenBtn.classList.contains("is-on"));
    });

    if (hangupBtn) hangupBtn.addEventListener("click", function () {
        paintMic(true);
        paintCam(false);
        paintScreen(false);
    });

    window.openCallCamera = function () {
        paintCam(true);
    };

    var handle = document.getElementById("call-resize");
    if (!handle) return;

    var minH = 220;
    var dragging = false;
    var startY = 0;
    var startH = 0;

    function maxHeight() {
        var parent = stage.parentElement;
        var bar = parent.querySelector(".group-bar, .dm-bar");
        var compose = parent.querySelector(".group-compose, .dm-compose");
        var taken = (bar ? bar.offsetHeight : 0) + (compose ? compose.offsetHeight : 0) + 96;
        return Math.max(minH, parent.clientHeight - taken);
    }

    function setHeight(next) {
        stage.style.height = Math.round(Math.min(maxHeight(), Math.max(minH, next))) + "px";
    }

    handle.addEventListener("pointerdown", function (event) {
        if (stage.hidden) return;
        dragging = true;
        startY = event.clientY;
        startH = stage.getBoundingClientRect().height;
        handle.setPointerCapture(event.pointerId);
        document.body.classList.add("call-resizing");
    });

    handle.addEventListener("pointermove", function (event) {
        if (!dragging) return;
        setHeight(startH + (event.clientY - startY));
    });

    function stopDrag() {
        if (!dragging) return;
        dragging = false;
        document.body.classList.remove("call-resizing");
    }

    handle.addEventListener("pointerup", stopDrag);
    handle.addEventListener("pointercancel", stopDrag);

    handle.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        var current = stage.getBoundingClientRect().height;
        setHeight(current + (event.key === "ArrowDown" ? 24 : -24));
    });
})();
