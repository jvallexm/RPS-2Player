const config = {
    apiKey: "AIzaSyCIDyBWEfQT-curOeFSfTNPENDKr1jKhbU",
    authDomain: "rps-2p.firebaseapp.com",
    databaseURL: "https://rps-2p.firebaseio.com",
    projectId: "rps-2p",
    storageBucket: "",
    messagingSenderId: "1070185676309"
  };

firebase.initializeApp(config);
const database    = firebase.database();
const connections = database.ref("connections");
const connected   = database.ref(".info/connected");

database.ref("chats").set([]);

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

function makeIcon(i){
	let obj = buttons[i];
	return $("<button>").addClass("btn icon")
						.attr("name", obj.name)
						.attr("title", obj.name)
						.attr("id", obj.name.toLowerCase())
						.attr("icon", i)
						.text(obj.display);
}

// Appends the icons to the selected player

function appendIcons(num){

	console.log("rendering icons for " + num);

	for(let i = 0 ; i < buttons.length; i++){
		makeIcon(i).appendTo("#player-" + num + "-icons");
	}

}

// Empties icons

function emptyIcons(num){
	console.log("empying icons for player " + num);
	$("#player-" + num + "-icons").empty();
}

// Creates a new player

function newPlayer(number, name){
		database.ref("players").child(number).set({
			name: name,
			wins: 0,
			losses: 0
		});
		$("#name-form").addClass("display-none");
		$("<h3>").text("Welcome " + name + ", you are Player " + number + "!").appendTo("#welcome");
}

// Sets a players choice

function playerChoice(num,name,turns){
	database.ref("players").child(num).child("choice").set(name);
	setTurns(turns+1);
}

// Sets turns

function setTurns(turn){
	database.ref("players").child("turns").set(turn);
}

// Sets a players wins or losses

function setWinsOrLosses(num,winsOrLosses,count){

	database.ref("players").child(num).child(winsOrLosses).set(count + 1);

}

// Lets each player take a turn

function takeTurn(you, num, choice){

	emptyIcons("1");
	emptyIcons("2");

	if(choice !== -1 && you !== num){

		makeIcon(choice).appendTo("#player-" + you + "-icons");
	}

	if(you === num){

		appendIcons(num);

	} else {

		waitingFor(num);

	}

}

// Appends a waiting for header

function waitingFor(num){
	$("<h4>").text("Waiting for Player " + num + " to choose")
  			 .addClass("waiting-for")	
	         .appendTo("#player-" + num + "-icons");
}

// Determines who wins

function whoWins(a,b){

	if(a === b)
		return 0;

	else if ( (a === "rock"     && b === "scissors" )
		   || (a === "rock"     && b === "lizard"   )
		   || (a === "paper"    && b === "rock"     )
		   || (a === "paper"    && b === "spock"    )
		   || (a === "scissors" && b === "paper"    )
		   || (a === "scissors" && b === "lizard"   )
		   || (a === "lizard"   && b === "paper"    )
		   || (a === "lizard"   && b === "spock"    )
		   || (a === "spock"    && b === "scissors" )
		   || (a === "spock"    && b === "rock"     ) )
		return 1;

	else 
		return 2;

}

// Modifies the database based on a winner

function whoWon(winner,player1,player2){

	setTurns(4);
	if(winner === 0){

		$("#game-text").text("It's a tie!");

	} else if(winner === 1){

		setWinsOrLosses("1" , "wins"  , player1.wins);
		setWinsOrLosses("2" , "losses" , player2.losses); 
		$("#game-text").text(player1.name + " wins!");

	} else {

		setWinsOrLosses("2" , "wins"  , player2.wins);
		setWinsOrLosses("1" , "losses" , player1.losses); 
		$("#game-text").text(player2.name + " wins!");

	}
	setTimeout(function(){

		setTurns(1);
		$("#game-text").text("");
		$("#player-1-choice").text("");
		$("#vs").text("");
		$("#player-2-choice").text("");

	},5000);

}

// When the document is ready...

$(document).ready(function(){

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
	let gameOn = false;
	let turn = 0;
	let yourChoice = -1;

	// Gets database snapshots whenever the info changes

	database.ref().on("value",function(snap){

		let players = snap.val().players;                                     // Current players
		let currentConnections = Object.keys(snap.val().connections).length;  // How many connections

		// If you are the only connection or if players is not defined
		// It initializes a new players object in the database

		if(players === undefined || (you == undefined && currentConnections === 1) )
		{
			console.log("initializing players");
			database.ref("players").set({
				"1": {
					name: "",
					wins: 0,
					losses: 0
				},
				"2": {
					name: "",
					wins: 0,
					losses: 0
				},
				turns: 0
			});

			player1 = players["1"];
			player2 = players["2"];

		} else {

			// Makes the references to players 1 and 2

			player1 = players["1"];
			player2 = players["2"];

			// Sets player 1's name

			if(player1.name !== "") {

				$("#player-1-name").text(player1.name);
				$("#player-1-bottom").removeClass("hidden");

			}

			// Sets player 2's name

			if(player2.name !== "") {

				$("#player-2-name").text(player2.name);
				$("#player-2-bottom").removeClass("hidden");

			}

			// Updates both players wins and loses

			$("#player-1-wins").text(player1.wins);
			$("#player-2-wins").text(player2.wins);
			$("#player-1-losses").text(player1.losses);
			$("#player-2-losses").text(player2.losses);

			// If both player 1 and player 2 are logged in it hides the name form

			if(player1.name !== "" && player2.name !== ""){

				$("#name-form").addClass("display-none");

				if(!gameOn){

					gameOn = true;
					database.ref("players").child("turns").set(1);

				} else if(players.turns > 0) {

					turns = players.turns;
					gameOn = true;
					console.log("the game is on");
					yourChoice = -1;

					if(players.turns === 1){

						takeTurn(you, "1", yourChoice);
						$("#player-1").addClass("active");

					} else if (players.turns === 2) {

						$("#player-2").addClass("active");
						$("#player-1").removeClass("active");
						takeTurn(you, "2", yourChoice);

					} else if (players.turns === 3) {

						$("#player-2").removeClass("active");
						emptyIcons("1");
						emptyIcons("2");
						console.log("Determining winner...");

						let winner = whoWins(player1.choice,player2.choice);
						console.log("winner is " + winner);

						$("#player-1-choice").text(player1.choice);
						$("#vs").text("vs");
						$("#player-2-choice").text(player2.choice);
						whoWon(winner,player1,player2);

					}

				}
			}

		}

	});

	$("#name-form").submit(function(e){
		e.preventDefault();

		let newName = $("#name-text").val().trim();

		if(newName != "" && newName.length < 25){

			console.log("trying to connect " + newName);

			if(player1.name === ""){

				you = "1";
				newPlayer("1",newName);

			} else {

				you = "2";
				newPlayer("2",newName);

			}

		} else if(newName.length >= 25) {

			$("name-text").val("");
			$("#welcome").text("Hey, that name is too long!");

		}

	});

	$("body").on("click",".icon",function(){

		console.log("You clicked " + this.title);
		yourChoice = parseInt($(this).attr("icon"));
		playerChoice(you,this.id,turns);

	});

});


