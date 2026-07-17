// Cloudflare Worker のURL
const API_URL = "https://kziban-api.y-bb0.workers.dev/api/posts";


// 投稿一覧を取得
async function loadPosts() {

  const postsArea = document.getElementById("posts");

  try {

    const response = await fetch(API_URL);

    const posts = await response.json();


    if (posts.length === 0) {

      postsArea.innerHTML = "まだ投稿はありません。";
      return;

    }


    postsArea.innerHTML = "";


    posts.forEach(post => {

      const div = document.createElement("div");

      div.className = "post";


      const date = new Date(post.created_at);

      const dateText =
        date.toLocaleString("ja-JP");


      div.innerHTML = `

        <div class="post-header">
          ${escapeHTML(post.name)}
          さん　
          ${dateText}
        </div>


        <div class="post-message">
          ${escapeHTML(post.message)}
        </div>


        <button onclick="reply(${post.id})">
          返信
        </button>

      `;


      postsArea.appendChild(div);

    });


  } catch (error) {

    postsArea.innerHTML =
      "投稿の読み込みに失敗しました。";

    console.error(error);

  }

}



// 投稿送信
async function sendPost() {


  const name =
    document.getElementById("name").value.trim();


  const message =
    document.getElementById("message").value.trim();



  if (!name || !message) {

    alert("名前と本文を入力してください。");
    return;

  }



  try {


    const response = await fetch(
      API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          name: name,

          message: message,

          parent_id: null

        })

      }
    );


    const result =
      await response.json();



    if (result.success) {

      document.getElementById("message").value = "";

      loadPosts();

    }
    else {

      alert("投稿に失敗しました。");

    }



  } catch(error) {

    console.error(error);

    alert("通信エラーです。");

  }


}



// HTMLエスケープ
function escapeHTML(text) {

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}



// 返信（後で実装）
function reply(id) {

  alert(
    "返信機能は現在準備中です。\n投稿ID：" + id
  );

}



// 投稿ボタン
document
  .getElementById("post-button")
  .addEventListener(
    "click",
    sendPost
  );



// ページ読み込み時
loadPosts();
