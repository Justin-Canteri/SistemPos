// renderer.js (linked in your index.html)
const dato = document.getElementById('titulo');

async function runPing() {
    // We use window.api because that's what we defined in contextBridge
    const respuesta = await window.api.ping();
    
    // innerHTML is a property assignment, not a method call
    dato.innerHTML = respuesta; 
}


//DB
/*------------------------------------------------------------------------------*/
async function displayProducts() {
  const Products = await window.api.getProducts();
  const userList = document.getElementById('products-list');

  Products.forEach(Products => {
    const li = document.createElement('li');
    li.textContent = `${Products.id} ${Products.nombre} - ${Products.precio}`;
    userList.appendChild(li);
  });
}

// Call function on page load
document.addEventListener('DOMContentLoaded', displayProducts);
/*------------------------------------------------------------------------------*/

runPing(); 