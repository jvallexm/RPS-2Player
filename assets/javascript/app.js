const config = {
    apiKey: "AIzaSyCIDyBWEfQT-curOeFSfTNPENDKr1jKhbU",
    authDomain: "rps-2p.firebaseapp.com",
    databaseURL: "https://rps-2p.firebaseio.com",
    projectId: "rps-2p",
    storageBucket: "",
    messagingSenderId: "1070185676309"
  };

firebase.initializeApp(config);

const database = firebase.database();
const connections = database.ref("connections");
const connected = database.ref(".info/connected");

// Connects and disconnects users

connected.on("value", function(snap) {

  if (snap.val()) {
  	console.log("connected " + connections);
    const con = connections.push(true);
    con.onDisconnect().remove();
  }

});

let player1;
let player2;


database.ref().on("value",function(snap){

	let players = snap.val().players;
	if(players === undefined)
	{
		console.log("players is undefined");
		database.ref("players").set({
			"1": {
				name: "",
				wins: 0,
				loses: 0
			},
			"2": {
				name: "",
				wins: 0,
				loses: 0
			},
			turns: 0
		});
	} else {

		// Makes the references to players 1 and 2

		player1 = players["1"];
		player2 = players["2"];

		// Sets player 1's name

		if(player1.name !== "")
			$("#player-1-name").text(player1.name);
		else
			$("#player-1-name").text("Waiting for Player 1...");

		// Sets player 2's name

		if(player2.name !== "")
			$("#player-2-name").text(player2.name);
		else
			$("#player-1-name").text("Waiting for Player 2...");

		// If both player 1 and player 2 are logged in it hides the name form

		if(player1.name !== "" && player2.name !== "")
			$("#name-form").addClass("display-none");
		else
			$("#name-form").removeClass("display-none");
	}

});

function newPlayer(number, name){
	database.ref("players").child(number).set({
		name: name,
		wins: 0,
		loses: 0
	});
}

$("#name-form").submit(function(e){
	e.preventDefault();

	let newName = $("#name-text").val().trim();

	if(newName != ""){
		console.log("trying to connect " + newName);
		if(player1.name == "")
			newPlayer("1",newName);
		else
			newPlayer("2",newName);
	}

});
