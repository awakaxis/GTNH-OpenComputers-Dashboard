const EU_POLL_MIN_DELAY = 1000;
const EU_BUFFER_SIZE = 100;
const EU_FORMATTER = new Intl.NumberFormat("en-US", {
  notation: "scientific",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

doGetTest();
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
let euValues = [];

// let debug = randGraphVerts(50, 42, 42, 100, 100, 0.5, 0.1, false);

// renderLineGraph(graph, debug, 100, 100, false, true, 42);

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
  generateX,
) {
  const verts = [];
  for (let i = 0; i < count + 1; i++) {
    startY += (Math.random() - bias) * (range * variance);
    startY = Math.max(0, Math.min(startY, range));
    if (generateX) {
      verts.push({ x: i * (domain / maxCount), y: startY });
    } else {
      verts.push(startY);
    }
  }
  return verts;
}

// if fixedInterval, vertices is just an array of values that will be evenly placed across the domain (useful for fixed sample rate data)
function renderLineGraph(
  svg,
  vertices,
  domain,
  range,
  multiGradient,
  fixedInterval,
  maxCount,
) {
  const xResolution = svg.getAttribute("width");
  const yResolution = svg.getAttribute("height");

  const domainToImage = xResolution / domain;
  const rangeToImage = yResolution / range;

  if (vertices.length < 2) {
    console.warn("line graph must have at least 2 vertices");
    return;
  }

  var gradientPoints = null;
  var oldSlope = null;

  const lineGroup = document.getElementById("lines");
  const gradientGroup = document.getElementById("gradients");
  lineGroup.innerHTML = "";
  gradientGroup.innerHTML = "";

  for (let i = 0; i < vertices.length - 1; i++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    // convert our data points from graph space to image space so that they can be rendered
    let pVertex = null;
    let nVertex = null;
    if (fixedInterval) {
      pVertex = {
        x: i * (domain / (maxCount - 2)) * domainToImage,
        y: (vertices[i] * -1 + range) * rangeToImage,
      };
      nVertex = {
        x: (i + 1) * (domain / (maxCount - 2)) * domainToImage,
        y: (vertices[i + 1] * -1 + range) * rangeToImage,
      };
    } else {
      pVertex = {
        x: vertices[i].x * domainToImage,
        y: (vertices[i].y * -1 + range) * rangeToImage,
      };
      nVertex = {
        x: vertices[i + 1].x * domainToImage,
        y: (vertices[i + 1].y * -1 + range) * rangeToImage,
      };
    }

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
      const fY = fixedInterval
        ? (vertices[0] * -1 + range) * rangeToImage
        : (vertices[0].y * -1 + range) * rangeToImage;
      if (!multiGradient) {
        slope =
          fY === nVertex.y
            ? "neutral"
            : nVertex.y < fY
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

function doGetTest() {
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
    const json = JSON.parse(xhr.responseText);
    const FORMAT_THRESHOLD = 100000;
    console.log(xhr.responseText);

    stored = Number(json["stored"]);
    avg_in = Number(json["avg_in"]);
    avg_out = Number(json["avg_out"]);
    passive_loss = Number(json["passive_loss"]);

    net_change = avg_in - avg_out - passive_loss;

    document.getElementById("eu-span").innerHTML =
      stored <= FORMAT_THRESHOLD ? stored : EU_FORMATTER.format(stored);

    document.getElementById("eu-net-change-span").innerHTML =
      Math.abs(net_change) <= FORMAT_THRESHOLD
        ? net_change
        : EU_FORMATTER.format(net_change);

    document.getElementById("eu-net-change-span").style =
      "color: var(--color-" +
      (net_change == 0 ? "text" : net_change > 0 ? "green" : "red") +
      ");";

    document.getElementById("eu-average-in-span").innerHTML =
      avg_in <= FORMAT_THRESHOLD ? avg_in : EU_FORMATTER.format(avg_in);

    document.getElementById("eu-average-out-span").innerHTML =
      avg_out <= FORMAT_THRESHOLD ? avg_out : EU_FORMATTER.format(avg_out);

    document.getElementById("eu-passive-loss-span").innerHTML =
      passive_loss <= FORMAT_THRESHOLD
        ? passive_loss
        : EU_FORMATTER.format(passive_loss);

    euValues.push(stored);
    while (euValues.length > EU_BUFFER_SIZE) {
      euValues.shift();
    }

    renderLineGraph(
      graph,
      euValues,
      EU_BUFFER_SIZE,
      5.4e10,
      false,
      true,
      EU_BUFFER_SIZE,
    );

    setTimeout(pollEU, Math.max(EU_POLL_MIN_DELAY - elapsed, 0));
  };
  xhr.send();
}
