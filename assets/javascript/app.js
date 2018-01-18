const config = {
    apiKey: "AIzaSyCIDyBWEfQT-curOeFSfTNPENDKr1jKhbU",
    authDomain: "rps-2p.firebaseapp.com",
    databaseURL: "https://rps-2p.firebaseio.com",
    projectId: "rps-2p",
    storageBucket: "",
    messagingSenderId: "1070185676309"
  };

firebase.initializeApp(config);

// Buttons for players to press

const buttons = [{
	name    : "Rock",
	display : "🗿"
},{
	name    : "Paper",
	display : "📄"
},{
	name    : "Scissors",
	display : "✂️"
},{
	name    : "Lizard",
	display : "🦎"
},{
	name    : "Spock",
	display : "🖖"
}]; 

// Creates a new button based on the object passed

function makeIcon(obj){
	return $("<button>").addClass("btn icon")
						.attr("name", obj.name)
						.attr("title", obj.name)
						.attr("id", obj.name.toLowerCase())
						.text(obj.display);
}

// Appends the icons to the selected div

function makeIcons(div){

	for(let i = 0 ; i < buttons.length; i++){
		makeIcon(buttons[i]).appendTo(div);
	}

}

const database = firebase.database();
const connections = database.ref("connections");
const connected = database.ref(".info/connected");

// Connects and disconnects users

connected.on("value", function(snap) {

  if (snap.val()) {
  	console.log("connected");
    const con = connections.push(true);
    con.onDisconnect().remove();
  }

});

// Stores the two players and which player you are

let player1;
let player2;
let you;


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

		if(player1.name !== ""){

			$("#player-1-name").text(player1.name);
			$("#player-1-bottom").removeClass("hidden");
			
		}
		else{

			$("#player-1-name").text("Waiting for Player 1");

		}

		// Sets player 2's name

		if(player2.name !== ""){

			$("#player-2-name").text(player2.name);
			$("#player-2-bottom").removeClass("hidden");
			
		}
		else{

			$("#player-2-name").text("Waiting for Player 2");

		}

		// If both player 1 and player 2 are logged in it hides the name form

		if(player1.name !== "" && player2.name !== "")
			$("#name-form").addClass("display-none");
	}

});

function newPlayer(number, name){
	database.ref("players").child(number).set({
		name: name,
		wins: 0,
		loses: 0
	});
	$("#name-form").addClass("display-none");
	$("<h3>").text("Welcome " + name + " you are Player " + number + "!").appendTo("#welcome");
}

$("#name-form").submit(function(e){
	e.preventDefault();

	let newName = $("#name-text").val().trim();

	if(newName != ""){
		console.log("trying to connect " + newName);
		if(player1.name == ""){
			you = "1";
			newPlayer("1",newName);
		}
		else{
			you = "2";
			newPlayer("2",newName);
		}
	}

});

$("body").on("click",".icon",function(){

	console.log("You clicked " + this.title);

});


