"use strict";
const initialPosts = [
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
function loadPosts() {
    const data = localStorage.getItem("blogPosts");
    if (data) {
        return JSON.parse(data);
    }
    return initialPosts;
}
function savePosts(posts) {
    localStorage.setItem("blogPosts", JSON.stringify(posts));
}
function renderPost(post) {
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
        post.comments.forEach((comment) => {
            const commentDiv = createElement("div", "");
            commentDiv.appendChild(createElement("p", `${comment.author} — ${comment.date}`));
            commentDiv.appendChild(createElement("p", comment.text));
            commentsDiv.appendChild(commentDiv);
        });
        div.appendChild(commentsDiv);
    }
    if (isLoggedIn()) {
        renderCommentForm(post, div);
    }
}
function renderCommentForm(post, div) {
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
    form.onsubmit = (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text)
            return;
        if (!post.comments) {
            post.comments = [];
        }
        const newComment = {
            author: state.currentUser?.name || "Anonym",
            text: text,
            date: new Date().toLocaleDateString("sv-SE"),
        };
        post.comments.push(newComment);
        savePosts(state.posts);
        renderMainPage();
    };
}
function createNewPost() {
    const title = document.getElementById("postTitle");
    const text = document.getElementById("postText");
    const newPost = {
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
    const createPostBtn = document.getElementById("createPostBtn");
    const createPostForm = document.getElementById("postForm");
    for (const post of state.posts) {
        renderPost(post);
    }
    if (state.currentUser?.isRedaktor) {
        createPostBtn.hidden = false;
        createPostForm.hidden = true;
        createPostBtn.onclick = () => {
            createPostForm.hidden = false;
            createPostBtn.hidden = true;
        };
        createPostForm.onsubmit = (e) => {
            e.preventDefault();
            createNewPost();
            createPostForm.reset();
            createPostForm.hidden = true;
            createPostBtn.hidden = false;
            renderMainPage();
        };
    }
    else {
        createPostBtn.hidden = true;
        createPostForm.hidden = true;
    }
}
