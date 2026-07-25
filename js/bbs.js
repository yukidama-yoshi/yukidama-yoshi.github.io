// Cloudflare Worker API
const API_URL = "https://kziban-api.y-bb0.workers.dev/api/posts";

// 現在返信中の投稿ID
let replyTarget = null;
let replyTargetName = "";


// ==========================
// 投稿一覧取得
// ==========================
async function loadPosts() {

    const postsArea = document.getElementById("posts");

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const posts = await response.json();

        postsArea.innerHTML = "";

        if (posts.length === 0) {

            postsArea.textContent = "まだ投稿はありません。";

            return;

        }

        // 親投稿のみ表示
        posts
            .filter(post => post.parent_id === null)
            .forEach(post => {

                postsArea.appendChild(
                    createPostElement(post, posts, 0)
                );

            });

    }

    catch (error) {

        console.error(error);

        postsArea.textContent =
            "投稿の取得に失敗しました。";

    }

}



// ==========================
// 投稿1件作成
// ==========================
function createPostElement(post, posts, depth) {

    const div = document.createElement("div");
    div.className = "post";

    if (depth > 0) {

        div.classList.add("reply");

    }

    // ヘッダー
    const header = document.createElement("div");
    header.className = "post-header";

    header.textContent =
        `${post.name} さん　${new Date(post.created_at).toLocaleString("ja-JP")}`;

    // 本文
    const message = document.createElement("div");
    message.className = "post-message";

    // ★ここが重要
    // innerHTMLではなくtextContentを使うので
    // 余計なスペースは絶対入りません
    message.textContent = post.message;

    // ボタンエリア
    const actions = document.createElement("div");
    actions.className = "post-actions";

    // 返信ボタン
    const replyButton =
        document.createElement("button");

    replyButton.type = "button";
    replyButton.textContent = "返信";

    replyButton.addEventListener("click", () => {

        setReply(
            post.id,
            post.name
        );

    });

    actions.appendChild(replyButton);

    div.appendChild(header);
    div.appendChild(message);
    div.appendChild(actions);

    // 子返信
    posts
        .filter(child => child.parent_id === post.id)
        .forEach(child => {

            div.appendChild(
                createPostElement(
                    child,
                    posts,
                    depth + 1
                )
            );

        });

    return div;

}



// ==========================
// 返信開始
// ==========================
function setReply(id, name) {

    replyTarget = id;
    replyTargetName = name;

    const box =
        document.getElementById("reply-box");

    const text =
        document.getElementById("reply-target-text");

    if (box && text) {

        box.style.display = "";

        text.textContent =
            `>>${id} ${name}`;

    }

    const button =
        document.getElementById("post-button");

    if (button) {

        button.textContent = "返信する";

    }

    document
        .getElementById("message")
        .focus();

}



// ==========================
// 返信解除
// ==========================
function cancelReply() {

    replyTarget = null;
    replyTargetName = "";

    const box =
        document.getElementById("reply-box");

    if (box) {

        box.style.display = "none";

    }

    const button =
        document.getElementById("post-button");

    if (button) {

        button.textContent = "投稿する";

    }

}
// ==========================
// 投稿送信
// ==========================
async function sendPost() {

    const name =
        document
            .getElementById("name")
            .value
            .trim();

    const message =
        document
            .getElementById("message")
            .value
            .trim();

    if (!name) {

        alert("名前を入力してください。");

        return;

    }

    if (!message) {

        alert("本文を入力してください。");

        return;

    }

    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        message: message,

                        parent_id: replyTarget

                    })

                }
            );

        const result =
            await response.json();

        if (!response.ok) {

            throw new Error(
                result.error ??
                "投稿に失敗しました。"
            );

        }

        // 本文だけクリア
        document
            .getElementById("message")
            .value = "";

        cancelReply();

        await loadPosts();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

}



// ==========================
// イベント登録
// ==========================

document
    .getElementById("post-button")
    .addEventListener(
        "click",
        sendPost
    );



const cancelReplyButton =
    document.getElementById("cancel-reply");

if (cancelReplyButton) {

    cancelReplyButton.addEventListener(
        "click",
        cancelReply
    );

}



// Ctrl+Enter投稿
const messageBox =
    document.getElementById("message");

if (messageBox) {

    messageBox.addEventListener(
        "keydown",
        event => {

            if (
                event.ctrlKey &&
                event.key === "Enter"
            ) {

                event.preventDefault();

                sendPost();

            }

        }
    );

}



// ==========================
// 初期化
// ==========================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPosts();

    }
);
