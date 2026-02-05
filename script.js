doGet();

document.getElementById("send").addEventListener("click", function (event) {
  doGet();
});

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
