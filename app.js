const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.meassage}`);
    process.exit(1);
  }
};
initializeDBAndServer();
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from cricket_team order by player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `insert into cricket_team 
    (player_name,jersey_number,role)
    values
    (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerID = dbResponse.lastID;
  response.send("Player Added to Team");
});
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from cricket_team where player_id= ${playerId};`;
  const playerArray = await db.get(getPlayerQuery);
  response.send(playerArray);
});
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `
    UPDATE cricket_team
    SET player_name = ?,
        jersey_number = ?,
        role = ?
    WHERE player_id = ?`;
  try {
    await db.run(updateQuery, [playerName, jerseyNumber, role, playerId]);
    response.send("Player Details Updated");
  } catch (error) {
    console.error("Error updating player details:", error);
    response.status(500).send("Internal Server Error");
  }
});
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `delete from cricket_team where player_id= ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
