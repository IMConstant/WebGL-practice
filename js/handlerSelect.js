import {gl} from "./context";

const select = document.querySelector("select");
/*
select.addEventListener("change", e => {
    
    const value = e.target.value; // [triangles, lines]
    
    const config = {
        triangles: a,
        lines: b
    }
    
    config[value]();
    
})*/


export function getType(){
    
    const config = {
        triangles: gl.TRIANGLES,
        lines: gl.LINES,
        triangleStrip: gl.TRIANGLE_STRIP,
        lineLoop: gl.LINE_LOOP
    }
    
    return config[select.value];
}
