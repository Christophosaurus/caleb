import { resizeCanvas, listenToChanges } from "./window"

const canvas = document.getElementById("game_canvas")
listenToChanges(canvas);
resizeCanvas(canvas);


