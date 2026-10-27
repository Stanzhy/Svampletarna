
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
    id: 1,
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
  div.appendChild(createElement("p", `${post.author} - ${post.date}`));

  DOM.mainContainer.appendChild(section);

  if (post.comments.length > 0) {
    const commentsDiv = createElement("div", "");
    post.comments.forEach((comment: BlogComment) => {
      const commentDiv = createElement("div", "");
      commentDiv.appendChild(createElement("p", comment.text));
      commentDiv.appendChild(
        createElement("p", `${comment.author} - ${comment.date}`),
      );
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
  const label = document.createElement("label");
  label.textContent = "Skriv en kommentar: ";
  form.appendChild(label);
  const input = document.createElement("input");
  input.required = true;
  input.type = "text";
  form.appendChild(input);
  const button = document.createElement("button");
  button.textContent = "Kommentera";
  form.appendChild(button);
  div.appendChild(form);

  form.addEventListener("submit", (e: Event) => {
    e.preventDefault();
    const text = input.value;
    const newComment: BlogComment = {
      author: state.currentUser?.name,
      text: text,
      date: new Date().toLocaleDateString("sv-SE"),
    };
    post.comments.push(newComment);
    savePosts(state.posts);
    renderMainPage();
  });
}

function createNewPost(): void {
  const title = document.getElementById("postTitle") as HTMLInputElement;
  const text = document.getElementById("postText") as HTMLTextAreaElement;
  const newPost: BlogPost = {
    id: Date.now(),
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
  const createPostBtn = document.getElementById(
    "createPostBtn",
  ) as HTMLButtonElement;
  const createPostForm = document.getElementById("postForm") as HTMLFormElement;
  for (const post of state.posts) {
    renderPost(post);
  }

  if (state.currentUser?.isRedaktor) {
    createPostBtn.hidden = false;

    createPostBtn.onclick = (): void => {
      createPostForm.hidden = false;
      createPostBtn.hidden = true;
    };

    createPostForm.onsubmit = (e: Event): void => {
      e.preventDefault();
      createNewPost();
      createPostForm.reset();
      createPostForm.hidden = true;
      createPostBtn.hidden = false;
      renderMainPage();
    };
  } else {
    createPostBtn.hidden = true;
    createPostForm.hidden = true;
  }
}
