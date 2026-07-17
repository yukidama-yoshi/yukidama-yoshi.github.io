// Cloudflare Worker API
const API_URL = "https://kziban-api.y-bb0.workers.dev/api/posts";


// 返信対象
let replyTarget = null;


// 投稿一覧読み込み
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


    // 親投稿のみ表示
    posts
      .filter(post => post.parent_id === null)
      .forEach(post => {

        postsArea.appendChild(
          createPostElement(post, posts, 0)
        );

      });


  } catch (error) {

    console.error(error);

    postsArea.innerHTML =
      "投稿の読み込みに失敗しました。";

  }

}



// 投稿HTML作成（返信ツリー）
function createPostElement(post, posts, depth) {


  const div = document.createElement("div");

  div.className = "post";


  if (depth > 0) {

    div.classList.add("reply");

  }



  const date =
    new Date(post.created_at)
      .toLocaleString("ja-JP");



  div.innerHTML = `

    <div class="post-header">

      ${escapeHTML(post.name)}
      さん　

      ${date}

    </div>


    <div class="post-message">

      ${escapeHTML(post.message)}

    </div>


    <button onclick="setReply(${post.id})">

      返信

    </button>

  `;



  // 子投稿を追加

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



// 返信先設定
function setReply(id) {


  replyTarget = id;


  alert(
    "投稿ID " + id + " に返信します"
  );


}



// 投稿送信
async function sendPost() {


  const name =
    document.getElementById("name")
      .value
      .trim();



  const message =
    document.getElementById("message")
      .value
      .trim();



  if (!name || !message) {

    alert(
      "名前と本文を入力してください。"
    );

    return;

  }



  try {


    const response = await fetch(

      API_URL,

      {

        method: "POST",


        headers: {

          "Content-Type":
            "application/json"

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



    if (result.success) {


      document.getElementById("message")
        .value = "";



      replyTarget = null;



      loadPosts();


    } else {


      alert(
        "投稿に失敗しました。"
      );


    }



  } catch(error) {


    console.error(error);


    alert(
      "通信エラーです。"
    );


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



// 投稿ボタン
document

  .getElementById("post-button")

  .addEventListener(

    "click",

    sendPost

  );



// 初期読み込み

loadPosts();
