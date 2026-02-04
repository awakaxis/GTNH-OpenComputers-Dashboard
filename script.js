document.getElementById("send").addEventListener("click", function (event) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "http://127.0.0.1:8000/test/");
  xhr.onload = () => {
    console.log(xhr.status);
    console.log(xhr.responseText);
    document.getElementById("notice").innerHTML = JSON.parse(xhr.responseText)[
      "data"
    ];
  };
  xhr.send();
});
