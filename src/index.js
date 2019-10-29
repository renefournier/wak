let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty("--vh", `${vh}px`);
window.addEventListener("resize", () => {
  // We execute the same script as before
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
});

const url = "wss://renefournier.com/wak/ws";
// const url = "ws://localhost:9030";

const connection = new WebSocket(url);

let now;
let state = {};
const win = '<span class="fa fa-lg fa-check-circle"></span>';
const lose = '<span class="fa fa-lg fa-times-circle"></span>';

connection.onopen = () => {
  now = new Date();

  let username;

  if (
    !localStorage.getItem("username") ||
    localStorage.getItem("username").length === 0
  ) {
    username = prompt(
      "WAK! Who can tap the rectangles fastest?!\n\n" +
        "What shall we call you? Something glorious?\nOr Anonymous Coward? You decide!",
      "Anonymous Coward"
    );
    localStorage.getItem("username", username);
  } else {
    username = localStorage.getItem("username");
  }

  document.getElementById("username").value = username;
  register(username);

  let ping = setInterval(() => {
    //   console.log("hi");
    var data = {
      c: "ping"
    };
    connection.send(JSON.stringify(data));
  }, 15000);
};
connection.onclose = (e) => {
  let elapsed = (new Date() - now) / 1000;
  console.log(
    `xxx WebSocket closed: ${JSON.stringify(e)} after ${elapsed} seconds`
  );
  location.reload();
};

connection.onerror = (error) => {
  console.log(`!!! WebSocket error: ${JSON.stringify(error)}`);
};

connection.onmessage = (e) => {
  const data = JSON.parse(e.data);
  console.log("-->", data);

  switch (data.c) {
    case "p":
      document.getElementById("people").innerHTML =
        data.p + '&nbsp;<span class="fa fa-lg fa-user-circle"></span>';
      break;

    case "squares":
      // state = { ...data };
      console.log("Squares...", data.squares.length);
      data.squares.forEach((square, index) => {
        const opacity = square ? "1" : ".25";
        const id = `b${index}`;
        const el = document.getElementById(id);
        el.style.opacity = opacity;
        // el.innerHTML = "";
      });
      break;
    case "win":
      document.getElementById(`b${data.index}`).classList.add("win");
      document.getElementById(`b${data.index}`).innerHTML = win;
      var html = `
                  <span class="win">
                  ${
                    data.w
                  } <span class="fa fa-lg fa-check-circle"></span> &nbsp;
                </span>
                <span class="lose">

                  ${data.l} <span class="fa fa-lg fa-times-circle"></span>
                  </span>
                  `;
      document.getElementById("stats").innerHTML = html;
      document.getElementById("rounds").innerHTML =
        data.rr + '&nbsp;<span class="fa fa-hand-pointer-o"></span>';
      resetBoard();
      break;
    case "lose":
      document.getElementById(`b${data.index}`).classList.add("lose");
      document.getElementById(`b${data.index}`).innerHTML = lose;
      var html = `
                  <span class="win">
                  ${
                    data.w
                  } <span class="fa fa-lg fa-check-circle"></span> &nbsp;&nbsp;
                  </span>
                  <span class="lose">
                  ${data.l} <span class="fa fa-lg fa-times-circle"></span>
                  </span>

                  `;
      document.getElementById("stats").innerHTML = html;
      document.getElementById("rounds").innerHTML =
        data.rr + '&nbsp;<span class="fa fa-hand-pointer-o"></span>';
      resetBoard();
      break;
    case "atwi":
      const winner = data.rankings[0];
      const loser = data.rankings[data.rankings.length - 1];

      const rows = data.rankings.map((player) => {
        const place = player.geo
          ? [player.geo.city, player.geo.region, player.geo.country].join(", ")
          : "";
        return (
          player.wins +
          " wins: " +
          (player.un ? player.un : "Anonymous coward") +
          ". " +
          place
        );
      });
      const text = rows.join("\n");

      alert(`${text}`);
      break;
  }
};

document.getElementById("username").addEventListener("change", function(e) {
  console.log(e.target.value);
  const username = e.target.value.trim();
  localStorage.setItem("username", username);
  register(username);
});

var classname = document.getElementsByClassName("box");

var myFunction = function(e) {
  const index = parseInt(e.target.id.substr(1));
  console.log("id", index);
  var data = {
    c: "s",
    i: index
  };
  connection.send(JSON.stringify(data));
};

for (var i = 0; i < classname.length; i++) {
  classname[i].addEventListener("click", myFunction, false);
}

function resetBoard() {
  setTimeout(() => {
    for (let i = 0; i < 12; i++) {
      // console.log("hi");
      const el = document.getElementById(`b${i}`);
      el.classList.remove("lose");
      el.classList.remove("win");
      el.style.opacity = 0.25;
      el.innerHTML = "";
    }
  }, 750);
}

function register(username) {
  var data = {
    c: "un",
    n: username
  };
  connection.send(JSON.stringify(data));
}
