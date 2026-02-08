const EU_POLL_MIN_DELAY = 1000;

doGet();
pollEU();

document.getElementById("send").addEventListener("click", function (event) {
  doGet();
});

document.getElementById("echo").addEventListener("click", function (event) {
  const xhr = new XMLHttpRequest();
  // we can parameterize GET queries like this
  xhr.open("GET", "http://127.0.0.1:8000/echo?text=hello");
  xhr.onload = () => {
    console.log(xhr.responseText);
  };
  xhr.send();
});

var py = 200;
const graph = document.getElementById("eu-graph");

for (let i = 0; i < 60; i++) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  let ny = py + (Math.random() - 0.6) * 20;
  line.setAttribute("x1", i * 10);
  line.setAttribute("y1", py);
  line.setAttribute("x2", (i + 1) * 10);
  line.setAttribute("y2", ny);
  line.classList.add("graph");
  line.classList.add(ny < py ? "positive" : "negative");

  graph.appendChild(line);
  py = ny;
}

function doGet() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "http://127.0.0.1:8000/test/");
  xhr.onloadstart = () => {
    document.getElementById("send").innerHTML = "Fetching...";
  };
  xhr.onload = () => {
    console.log(xhr.status);
    console.log(xhr.responseText);
    document.getElementById("notice").innerHTML = JSON.parse(xhr.responseText)[
      "data"
    ];
    document.getElementById("send").innerHTML = "New Response";
  };
  xhr.send();
}

function pollEU() {
  const xhr = new XMLHttpRequest();
  const start = performance.now();
  xhr.open("GET", "http://127.0.0.1:8000/get-eu");
  xhr.onload = () => {
    const elapsed = performance.now() - start;
    document.getElementById("eu").innerHTML = JSON.parse(xhr.responseText)[
      "data"
    ];
    setTimeout(pollEU, Math.max(EU_POLL_MIN_DELAY - elapsed, 0));
  };
  xhr.send();
}
