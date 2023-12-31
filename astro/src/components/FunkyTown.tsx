import { useEffect } from "react";

let isPlaying = false

export default function FunkyTown() {
    useEffect(() => {
        const funkyTown = document.getElementById('funky-town') as any
        document.onmousedown = () => {
            if (!isPlaying && funkyTown) {
                funkyTown.play()
                isPlaying = true;
            }
        }
        document.ontouchstart = () => {
            if (!isPlaying && funkyTown) {
                funkyTown.play()
                isPlaying = true;
            }
        }
    });

    return <audio id='funky-town' loop>
        <source src="funky-town.mp3" type="audio/mpeg" />
    </audio> 
}