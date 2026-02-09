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

renderLineGraph(
  graph,
  randGraphVerts(65, 42, 42, 100, 100, 0.48, 0.1),
  100,
  100,
  false,
);

// bias should be between 0 and 1 where lower numbers bias the random values towards positive change.
// variance is the fraction of the range that any two adjacent data points can vary by at most
function randGraphVerts(
  startY,
  count,
  maxCount,
  domain,
  range,
  bias,
  variance,
) {
  const verts = [];
  for (let i = 0; i < count + 1; i++) {
    startY += (Math.random() - bias) * (range * variance);
    startY = Math.max(0, Math.min(startY, range));
    verts.push({ x: i * (domain / maxCount), y: startY });
  }
  return verts;
}

function renderLineGraph(svg, vertices, domain, range, multiGradient) {
  const xResolution = svg.getAttribute("width");
  const yResolution = svg.getAttribute("height");

  const domainToImage = xResolution / domain;
  const rangeToImage = yResolution / range;

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

    // convert our data points from graph space to image space so that they can be rendered
    const pVertex = {
      x: vertices[i].x * domainToImage,
      y: (vertices[i].y * -1 + range) * rangeToImage,
    };
    const nVertex = {
      x: vertices[i + 1].x * domainToImage,
      y: (vertices[i + 1].y * -1 + range) * rangeToImage,
    };

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

    // if multiGradient, the current gradient polygon is closed and flushed when the slope changes.
    if (multiGradient && oldSlope != slope && gradientPoints !== null) {
      gradientPoints += " " + pVertex.x + ",250";
      addGradient(gradientGroup, gradientPoints, oldSlope);
      gradientPoints = null;
    }

    // the gradient points must be reinitialized, drawing the left side of the gradient polygon.
    if (gradientPoints === null) {
      gradientPoints = pVertex.x + ",250 " + pVertex.x + "," + pVertex.y;
    }

    gradientPoints += " " + nVertex.x + "," + nVertex.y;

    // for the last iteration, the current gradient polygon must be closed at the bottom of the graph.
    if (i == vertices.length - 2) {
      gradientPoints += " " + nVertex.x + ",250";
      const fVertex = {
        x: vertices[0].x * domainToImage,
        y: (vertices[0].y * -1 + range) * rangeToImage,
      };
      if (!multiGradient) {
        slope =
          fVertex.y === nVertex.y
            ? "neutral"
            : nVertex.y < fVertex.y
              ? "positive"
              : "negative";
      }
      addGradient(gradientGroup, gradientPoints, slope);
      gradientPoints = null;
    }

    oldSlope = slope;
  }
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
