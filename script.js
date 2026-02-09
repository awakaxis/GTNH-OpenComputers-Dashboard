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
const lineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
const gradientGroup = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "g",
);
graph.appendChild(lineGroup);
graph.appendChild(gradientGroup);
var graphPoints = null;
var oldSlope = null;

for (let i = 0; i < 40; i++) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  const ny = py + (Math.random() - 0.52) * 50;
  const slope = ny === py ? "neutral" : ny < py ? "positive" : "negative";

  if (oldSlope === null) oldSlope = slope;

  line.setAttribute("x1", i * 10);
  line.setAttribute("y1", py);
  line.setAttribute("x2", (i + 1) * 10);
  line.setAttribute("y2", ny);
  line.classList.add("graph");
  line.classList.add(slope);
  lineGroup.appendChild(line);

  if (oldSlope != slope && graphPoints !== null) {
    graphPoints += " " + i * 10 + ",250";
    addGradient(graphPoints, oldSlope);
  }

  if (graphPoints === null) {
    graphPoints = i * 10 + ",250 " + i * 10 + "," + py;
  }

  graphPoints += " " + (i + 1) * 10 + "," + ny;

  if (i == 39) {
    graphPoints += " " + (i + 1) * 10 + ",250";
    addGradient(graphPoints, slope);
  }

  oldSlope = slope;
  py = ny;
}

function addGradient(group, points, sign) {
  const gradient = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon",
  );
  gradient.setAttribute("points", points);
  gradient.classList.add("eu-graph-gradient");
  gradient.classList.add(sign);
  group.appendChild(gradient);
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
