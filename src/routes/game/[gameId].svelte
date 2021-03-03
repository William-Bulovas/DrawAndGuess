<script lang="ts">
    import { SocketDao } from "../../socketDao";
    import { v4 as uuidv4 } from 'uuid';
    import DrawingCanvas from "../../components/DrawingCanvas.svelte";
    import ListeningCanvas from "../../components/ListeningCanvas.svelte";
    import { onMount } from "svelte";
    import { EventType } from "../../model/event";

    const clientId = uuidv4();

    let dao: SocketDao = null;
    let gameId: String;
    
    let clients: String[] = [];

	export async function preload({ params }) {
        const gameId = params.gameId;
        return { gameId };
    };
    
    onMount(() => {
        dao = new SocketDao(clientId, gameId);

        dao.connect(() => {
            dao.joinGame()

            dao.onMessage(event => {
                if (event.eventType == EventType.JOIN) {
                    console.log("Recieved Join Event");

                    clients = clients.concat([event.clientId]);
                }
            });
        });
    });
</script>

<div>
    <DrawingCanvas dao={dao}/>
    <div class="row">
        {#each clients as client}
            <div class="col-sm">
                <ListeningCanvas dao={dao} clientId={client}/>
            </div>
        {/each}
    </div>
</div>



