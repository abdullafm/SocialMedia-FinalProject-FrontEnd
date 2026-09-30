"use strict";
var micO = false;
var headO = false;

function fromLogin() {
    try {
        if (sessionStorage.getItem("discode-splash") === "1") {
            sessionStorage.removeItem("discode-splash");
            return true;
        }
    } catch (e) {}
    if (history.state && history.state.discode) return false;
    return /\/(login|register)\.html/i.test(document.referrer || "");
}

var keepLoader = !!document.getElementById("loader") && fromLogin();
if (keepLoader) document.documentElement.classList.add("show-loader");
else {
    document.documentElement.classList.remove("show-loader");
    var earlyLoader = document.getElementById("loader");
    if (earlyLoader) earlyLoader.remove();
}

window.onload = function () {
    if (!keepLoader) return;
    setTimeout(function () {
        var loader = document.getElementById("loader");
        if (loader) loader.remove();
        document.documentElement.classList.remove("show-loader");
    }, 2000);
};

var x = new Audio("./assets/css/audio/discordmute_IZNcLx2.mp3");
var y = new Audio("./assets/css/audio/discord-unmute-sound.mp3");

function mic() {
    if (!micO) {
        x.play();
        document.getElementById("mic").className = "fa-solid fa-microphone-slash mute";
        micO = true;
    } else {
        y.play();
        document.getElementById("mic").className = "fa-solid fa-microphone";
        micO = false;
    }
}

function headp() {
    if (!headO) {
        x.play();
        document.getElementById("head").className = "fa-solid fa-headphones mute";
        headO = true;
    } else {
        document.getElementById("head").className = "fa-solid fa-headphones";
        y.play();
        headO = false;
    }
}

function openToggle() {
    if (!window.matchMedia("(max-width: 720px)").matches) return;
    document.querySelector("main").classList.toggle("show-main");
}

(function () {
    var pick = document.getElementById("friend-filter-pick");
    var menu = document.getElementById("friend-filter-menu");
    var label = document.getElementById("friend-filter-label");
    var filters = document.querySelector(".friend-filters");
    if (!pick || !menu || !filters) return;
    function paintFriends(filter) {
        var onlineTitle = document.getElementById("friends-online-title");
        var allTitle = document.getElementById("friends-all-title");
        var list = document.querySelector("#friends-online .friends-online-list");
        if (!list) return;
        var rows = list.querySelectorAll(".online-row");
        var visible = 0;
        for (var i = 0; i < rows.length; i++) {
            var presence = rows[i].getAttribute("data-presence") || "online";
            var hide = filter === "online" && presence === "offline";
            rows[i].hidden = hide;
            if (!hide) visible++;
        }
        if (onlineTitle) onlineTitle.hidden = filter !== "online" || visible === 0;
        if (allTitle) allTitle.hidden = filter !== "all" || visible === 0;
    }
    function paintCount(title, rows) {
        if (!title) return;
        var count = title.querySelector("span");
        if (count) count.textContent = String(rows.length);
        title.hidden = rows.length === 0;
    }
    function paintPendingTitle() {
        var title = document.getElementById("friends-pending-title");
        var list = document.getElementById("friends-pending-list");
        var sentTitle = document.getElementById("friends-sent-title");
        var sentList = document.getElementById("friends-sent-list");
        paintCount(title, list ? list.querySelectorAll(".request-row") : []);
        paintCount(sentTitle, sentList ? sentList.querySelectorAll(".sent-row") : []);
    }
    function addSentRequest(username) {
        var list = document.getElementById("friends-sent-list");
        var template = document.getElementById("friend-sent-row");
        if (!list || !template) return;
        var existing = list.querySelectorAll(".sent-row");
        for (var i = 0; i < existing.length; i++) {
            if (existing[i].getAttribute("data-user") === username) {
                paintPendingTitle();
                return;
            }
        }
        var row = template.content.firstElementChild.cloneNode(true);
        row.setAttribute("data-user", username);
        var strong = row.querySelector("strong");
        var user = row.querySelector(".request-user");
        var letter = row.querySelector(".sent-letter");
        if (strong) strong.textContent = username;
        if (user) user.textContent = username;
        if (letter) letter.textContent = username.charAt(0).toUpperCase();
        list.appendChild(row);
        paintPendingTitle();
    }
    function paintBlockedTitle() {
        var title = document.getElementById("friends-blocked-title");
        var list = document.getElementById("friends-blocked-list");
        if (!title || !list) return;
        title.hidden = !list.querySelector(".blocked-row");
    }
    paintFriends("online");
    var glide = document.createElement("span");
    glide.className = "friend-filter-glide";
    glide.setAttribute("aria-hidden", "true");
    menu.insertBefore(glide, menu.firstChild);
    function moveGlide(button) {
        if (!button || button.getAttribute("data-filter") === "add") {
            glide.style.opacity = "0";
            return;
        }
        glide.style.opacity = "1";
        glide.style.width = button.offsetWidth + "px";
        glide.style.height = button.offsetHeight + "px";
        glide.style.transform = "translate(" + button.offsetLeft + "px, " + button.offsetTop + "px)";
    }
    moveGlide(menu.querySelector("button.active"));
    window.addEventListener("resize", function () {
        moveGlide(menu.querySelector("button.active"));
    });
    pick.addEventListener("click", function (event) {
        event.stopPropagation();
        var open = filters.classList.toggle("open");
        pick.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (event) {
        var button = event.target.closest("button");
        if (!button) return;
        var items = menu.querySelectorAll("button");
        for (var i = 0; i < items.length; i++) items[i].classList.toggle("active", items[i] === button);
        moveGlide(button);
        if (label) label.textContent = button.textContent;
        var online = document.getElementById("friends-online");
        var pending = document.getElementById("friends-pending");
        var blocked = document.getElementById("friends-blocked");
        var add = document.getElementById("friends-add");
        var empty = document.getElementById("friends-empty");
        var now = document.getElementById("active-now");
        var filter = button.getAttribute("data-filter");
        var showList = filter === "online" || filter === "all";
        var showPending = filter === "pending";
        var showBlocked = filter === "blocked";
        var showAdd = filter === "add";
        if (online) online.hidden = !showList;
        if (pending) pending.hidden = !showPending;
        if (blocked) blocked.hidden = !showBlocked;
        if (add) add.hidden = !showAdd;
        if (empty) empty.hidden = showList || showPending || showBlocked || showAdd;
        if (now) now.hidden = showList || showPending || showBlocked || showAdd;
        if (showList) paintFriends(filter);
        if (showPending) paintPendingTitle();
        if (showBlocked) paintBlockedTitle();
        filters.classList.remove("open");
        pick.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("click", function () {
        filters.classList.remove("open");
        pick.setAttribute("aria-expanded", "false");
    });
    var form = document.getElementById("add-friend-form");
    var nameInput = document.getElementById("add-friend-name");
    var messageInput = document.getElementById("add-friend-message");
    var send = document.getElementById("add-friend-send");
    var count = document.getElementById("add-friend-count");
    var ok = document.getElementById("add-friend-ok");
    var okName = document.getElementById("add-friend-ok-name");
    var error = document.getElementById("add-friend-error");
    if (!form || !nameInput || !send) return;
    nameInput.addEventListener("input", function () {
        send.disabled = nameInput.value.trim() === "";
        if (ok) ok.hidden = true;
        if (error) error.hidden = true;
    });
    if (messageInput && count) {
        messageInput.addEventListener("input", function () {
            count.textContent = String(120 - messageInput.value.length);
        });
    }
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var username = nameInput.value.trim();
        if (!username) return;
        var message = messageInput ? messageInput.value.trim() : "";
        send.disabled = true;
        if (ok) ok.hidden = true;
        if (error) error.hidden = true;
        addSentRequest(username);
        if (okName) okName.textContent = username;
        if (ok) ok.hidden = false;
        nameInput.value = "";
        if (messageInput) messageInput.value = "";
        if (count) count.textContent = "120";
        fetch("/api/friends/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, message: message })
        }).catch(function () {});
    });
    var sentList = document.getElementById("friends-sent-list");
    if (sentList) {
        sentList.addEventListener("click", function (event) {
            var button = event.target.closest(".sent-cancel");
            if (!button) return;
            var row = button.closest(".sent-row");
            if (!row) return;
            var username = row.getAttribute("data-user") || "";
            row.remove();
            paintPendingTitle();
            if (!username) return;
            fetch("/api/friends/requests/" + encodeURIComponent(username), { method: "DELETE" }).catch(function () {});
        });
    }
})();

(function () {
    var menu = document.getElementById("friend-more");
    if (!menu) return;
    var row = null;

    function closeMenu() {
        menu.hidden = true;
        row = null;
    }

    function openMenu(button) {
        row = button.closest(".online-row");
        menu.hidden = false;
        var rect = button.getBoundingClientRect();
        var width = menu.offsetWidth;
        var height = menu.offsetHeight;
        var left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
        var top = rect.bottom + 8;
        if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 8);
        menu.style.left = left + "px";
        menu.style.top = top + "px";
    }

    document.addEventListener("click", function (event) {
        var more = event.target.closest && event.target.closest("button.online-act[aria-label='More']");
        if (more) {
            event.preventDefault();
            event.stopPropagation();
            if (row && more.closest(".online-row") === row && !menu.hidden) closeMenu();
            else openMenu(more);
            return;
        }
        if (!event.target.closest || !event.target.closest("#friend-more")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeMenu();
    });

    menu.addEventListener("click", function (event) {
        var button = event.target.closest("button");
        if (!button || !row) return;
        var action = button.getAttribute("data-action");
        var link = row.querySelector(".online-main");
        var href = link ? link.getAttribute("href") : "";
        if ((action === "voice" || action === "video") && href) href += (href.indexOf("?") === -1 ? "?" : "&") + "call=" + action;
        if ((action === "video" || action === "voice") && href) {
            if (window.discodeGo) window.discodeGo(href);
            else window.location.href = href;
        }
        if (action === "remove") row.remove();
        closeMenu();
    });
})();
