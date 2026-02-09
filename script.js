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

const graph = document.getElementById("eu-graph");

renderLineGraph(graph, randGraphVerts(), false);

function randGraphVerts() {
  var py = 200;
  const verts = [];
  for (let i = 0; i < 41; i++) {
    py += (Math.random() - 0.52) * 50;
    verts.push({ x: i * 10, y: py });
  }
  return verts;
}

function renderLineGraph(svg, vertices, multiGradient) {
  if (vertices.length < 2) {
    console.error("line graph must have at least 2 vertices");
    return;
  }

  var gradientPoints = null;
  var oldSlope = null;

  const lineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const gradientGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g",
  );
  svg.appendChild(lineGroup);
  svg.appendChild(gradientGroup);

  for (let i = 0; i < vertices.length - 1; i++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const pVertex = vertices[i];
    const nVertex = vertices[i + 1];
    let slope =
      nVertex.y === pVertex.y
        ? "neutral"
        : nVertex.y < pVertex.y
          ? "positive"
          : "negative";

    if (oldSlope === null) oldSlope = slope;

    line.setAttribute("x1", pVertex.x);
    line.setAttribute("y1", pVertex.y);
    line.setAttribute("x2", nVertex.x);
    line.setAttribute("y2", nVertex.y);
    line.classList.add("graph");
    line.classList.add(slope);
    lineGroup.appendChild(line);

    if (multiGradient && oldSlope != slope && gradientPoints !== null) {
      gradientPoints += " " + pVertex.x + ",250";
      addGradient(gradientGroup, gradientPoints, oldSlope);
      gradientPoints = null;
    }

    if (gradientPoints === null) {
      gradientPoints = pVertex.x + ",250 " + pVertex.x + "," + pVertex.y;
    }

    gradientPoints += " " + nVertex.x + "," + nVertex.y;

    if (i == vertices.length - 2) {
      gradientPoints += " " + nVertex.x + ",250";
      const fVertex = vertices[0];
      const lVertex = vertices[i + 1];
      if (!multiGradient) {
        slope =
          fVertex.y === lVertex.y
            ? "neutral"
            : lVertex.y < fVertex.y
              ? "positive"
              : "negative";
      }
      addGradient(gradientGroup, gradientPoints, slope);
      gradientPoints = null;
    }

    oldSlope = slope;
    console.log(i);
  }
  console.log(vertices.length);
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
