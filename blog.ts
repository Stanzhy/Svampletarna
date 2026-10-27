// Кажемо TypeScript: «Ці змінні вже існують у script.js, просто дозволь мені їх використовувати»
declare const DOM: any;
declare const state: any;
declare function isLoggedIn(): boolean;
declare function createElement(tag: string, textContent: string): HTMLElement;

interface BlogPost {
  id: number;
  title: string;
  author: string;
  text: string;
  date: string;
  comments: BlogComment[];
}

interface BlogComment {
  author: string;
  text: string;
  date: string;
}

const initialPosts: BlogPost[] = [
  {
    id: 1234,
    title: "Mina bästa svampställen",
    author: "Kalle",
    text: "Idag hittade jag fantastiska kantareller djupt inne i granskogen!",
    date: "26 oktober 2026",
    comments: [
      {
        author: "Anna",
        text: "Vilket härligt fynd! Var det nära sjön?",
        date: "26 oktober 2026",
      },
    ],
  },
];

state.posts = loadPosts();

function loadPosts(): BlogPost[] {
  const data = localStorage.getItem("blogPosts");
  if (data) {
    return JSON.parse(data);
  }
  return initialPosts;
}

function savePosts(posts: BlogPost[]): void {
  localStorage.setItem("blogPosts", JSON.stringify(posts));
}

function renderPost(post: BlogPost): void {
  const section = createElement("section", "");
  section.classList.add("blog-post");
  const div = createElement("div", "");
  section.appendChild(div);
  div.appendChild(createElement("h3", post.title));
  div.appendChild(createElement("p", post.text));

  const meta = createElement("p", `${post.author} — ${post.date}`);
  meta.classList.add("post-meta");
  div.appendChild(meta);

  DOM.mainContainer.appendChild(section);

  if (post.comments && post.comments.length > 0) {
    const commentsDiv = createElement("div", "");
    commentsDiv.classList.add("comments");
    commentsDiv.appendChild(createElement("h4", "Kommentarer:"));
    post.comments.forEach((comment: BlogComment) => {
      const commentDiv = createElement("div", "");
      commentDiv.appendChild(
        createElement("p", `${comment.author} — ${comment.date}`),
      );
      commentDiv.appendChild(createElement("p", comment.text));
      commentsDiv.appendChild(commentDiv);
    });
    div.appendChild(commentsDiv);
  }
  if (isLoggedIn()) {
    renderCommentForm(post, div);
  }
}

function renderCommentForm(post: BlogPost, div: HTMLElement): void {
  const form = document.createElement("form");
  const input = document.createElement("input");
  input.required = true;
  input.type = "text";
  input.placeholder = "Skriv en kommentar...";
  form.appendChild(input);
  const button = document.createElement("button");
  button.textContent = "Skicka";
  form.appendChild(button);
  div.appendChild(form);

  form.onsubmit = (e: Event) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    if (!post.comments) {
      post.comments = [];
    }
    const newComment: BlogComment = {
      author: state.currentUser?.name || "Anonym",
      text: text,
      date: new Date().toLocaleDateString("sv-SE"),
    };
    post.comments.push(newComment);
    savePosts(state.posts);
    renderMainPage();
  };
}

function createNewPost(): void {
  const title = document.getElementById("postTitle") as HTMLInputElement;
  const text = document.getElementById("postText") as HTMLTextAreaElement;
  const newPost: BlogPost = {
    id: Date.now() % 10000,
    title: title.value,
    text: text.value,
    author: state.currentUser?.name,
    date: new Date().toLocaleDateString("sv-SE"),
    comments: [],
  };
  state.posts.push(newPost);
  savePosts(state.posts);
  renderMainPage();
}

function renderMainPage() {
  DOM.mainContainer.innerHTML = "";
  for (const post of state.posts) {
    renderPost(post);
  }

  if (state.currentUser?.isRedaktor) {
    DOM.createPostBtn.hidden = false;
    DOM.createPostForm.hidden = true;

    DOM.createPostBtn.onclick = (): void => {
      DOM.createPostForm.hidden = false;
      DOM.createPostBtn.hidden = true;
    };

    DOM.createPostForm.onsubmit = (e: Event): void => {
      e.preventDefault();
      createNewPost();
      DOM.createPostForm.reset();
      DOM.createPostForm.hidden = true;
      DOM.createPostBtn.hidden = false;
      renderMainPage();
    };
  } else {
    DOM.createPostBtn.hidden = true;
    DOM.createPostForm.hidden = true;
  }
}

function initBlogPage(): void {
  console.log(state.currentPage === "mainPage");
  if (state.currentPage === "mainPage") {
    console.log("mainPage");
  }
}

window.onload = initBlogPage;
