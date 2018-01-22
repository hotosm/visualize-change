const div = document.createElement("div");
div.innerText = "frontend works!";
document.body.appendChild(div);

fetch("/api/health-check").then(res => {
  const div = document.createElement("div");

  if (res.status === 200) {
    div.innerText = "api works!";
  } else {
    div.innerText = "api broken :|";
  }

  document.body.appendChild(div);
});
