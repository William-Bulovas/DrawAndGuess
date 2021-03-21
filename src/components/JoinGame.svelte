<!-- <script lang="ts">
    import type { SocketDao } from "../logic/socketDao";
    import type { PlayerScore } from "../model/playerScore";
    
    import DrawingCanvas from "./DrawingCanvas.svelte";
    import ListeningCanvas from "./ListeningCanvas.svelte";
    import PlayersSideBar from "./PlayersSideBar.svelte";
    
    export let dao: SocketDao;
    export let clientId: String;
    export let players: PlayerScore[];

    const joinGame = () => {
        currentPlayer = {
            player: {
                clientId: clientId,
                nickName: nickName
            },
            score: 0
        };

        dao.connect(() => {
            dao.joinGame()

            dao.onMessage(event => {
                if (event.eventType == EventType.JOIN) {
                    console.log("Recieved Join Event");

                    players = players.concat([{
                        player: event.player,
                        score: event.score
                    }]);
                }
            });
        });
    }
    
    </script>
    
    <main>
        <input bind:value={nickName}>
        <button on:click={joinGame}>Join</button>
    </main>
-->