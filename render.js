// renderer.js (linked in your index.html)
const dato = document.getElementById('titulo');

async function runPing() {
    // We use window.api because that's what we defined in contextBridge
    const respuesta = await window.api.ping();
    
    // innerHTML is a property assignment, not a method call
    dato.innerHTML = respuesta; 
}

runPing(); 