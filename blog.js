"use strict";
const initialPosts = [
    {
        id: 1234,
        title: "Jakten på höstens guld i skogen",
        author: "Kalle",
        text: "Det är en helt speciell känsla när morgondimman lättar över granskogen och marken doftar av fuktig mossa och barr. Idag bar det av djupt in i skogen för att leta efter säsongens första gula kantareller. Det här stället har jag återkommit till under flera år eftersom den fuktiga miljön och den gamla granskogen är idealisk för svamp. Gå långsamt, leta efter den gula färgen mot den mörka mossan och njut av en härlig stund i naturen inför nästa helg!",
        date: "26 oktober 2026",
        comments: [
            {
                author: "Anna",
                text: "Man känner nästan doften av skogen och den fuktiga mossan när man läser. Kantareller är verkligen höstens bästa guld, tack för inspirationen!",
                date: "26 oktober 2026 15:28",
            },
        ],
    },
];
const BlogStorage = {
    loadPosts() {
        const data = localStorage.getItem("blogPosts");
        return data ? JSON.parse(data) : initialPosts;
    },
    savePosts(posts) {
        localStorage.setItem("blogPosts", JSON.stringify(posts));
    },
};
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
    renderCommentForm(post, div);
}
function renderCommentForm(post, div) {
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.required = true;
    input.type = "text";
    input.placeholder = isLoggedIn()
        ? "Skriv en kommentar..."
        : "Logga in för att komentera!";
    form.appendChild(input);
    const button = document.createElement("button");
    button.textContent = "Skicka";
    form.appendChild(button);
    div.appendChild(form);
    input.disabled = !isLoggedIn();
    button.disabled = !isLoggedIn();
    form.onsubmit = (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (isLoggedIn()) {
            const newComment = {
                author: state.currentUser?.name || "Anonym",
                text: text,
                date: new Date().toLocaleString("sv-SE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                }) +
                    " " +
                    new Date().toLocaleTimeString("sv-SE").slice(0, 5),
            };
            post.comments.push(newComment);
            BlogStorage.savePosts(state.posts);
            renderMainPage();
        }
    };
}
function createNewPost() {
    const title = document.getElementById("postTitle");
    const text = document.getElementById("postText");
    const newPost = {
        id: Date.now(),
        title: title.value,
        text: text.value,
        author: state.currentUser?.name,
        date: new Date().toLocaleString("sv-SE", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }),
        comments: [],
    };
    state.posts.push(newPost);
    BlogStorage.savePosts(state.posts);
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
        DOM.createPostBtn.onclick = () => {
            DOM.createPostForm.hidden = false;
            DOM.createPostBtn.hidden = true;
        };
        DOM.createPostForm.onsubmit = (e) => {
            e.preventDefault();
            createNewPost();
            DOM.createPostForm.reset();
            DOM.createPostForm.hidden = true;
            DOM.createPostBtn.hidden = false;
            renderMainPage();
        };
    }
    else {
        DOM.createPostBtn.hidden = true;
        DOM.createPostForm.hidden = true;
    }
}
