// renderer.js (linked in your index.html)
const dato = document.getElementById('titulo');

//funcion pendiente a usar...
async function runPing() {
    // We use window.api because that's what we defined in contextBridge
    const respuesta = await window.api.ping();
    
    // innerHTML is a property assignment, not a method call
    dato.innerHTML = respuesta; 
}


//DB
/*------------------------------------------------------------------------------*/
//get all products
async function getallProducts() {
  const Products = await window.api.getProducts();
  const userList = document.getElementById('products-list');

  userList.innerHTML = '';

  Products.forEach(Products => {
    const li = document.createElement('li');
    li.textContent = `${Products.id} ${Products.name} - ${Products.price}`;
    userList.appendChild(li);
  });
};

//get product w id
async function getProductsIdRender(id) {
  const Products = await window.api.getProductsID(id);
  const userList = document.getElementById('products-list');

  userList.innerHTML = '';

  const li = document.createElement('li');
  const p = Products;
  li.textContent = `${p.name} - ${p.price}`;
  userList.appendChild(li);
};

//delete
async function DeleteProductsRender(id) {
  
  const Delete = await window.api.DeleteProducts(id);
  
  if(Delete){
    const userList = document.getElementById('products-list');
    userList.innerHTML = '';
    userList.textContent =`El producto fue eliminado con éxito`;
    
  } else {
    userList.textContent ='No se pudo eliminar el producto.';
  }
};

//update
async function UpdateProductsRender(id, name, price){

  if (!id || !name || !price) {
        alert("Por favor, completa todos los campos");
        return;
    }

  const Update = await window.api.UpdateProducts(id, name, price);

  if(Update){
    const userList = document.getElementById('products-list');
    userList.innerHTML = '';
    userList.textContent = `El producto fue editado con éxito`;
    
  } else {
    userList.textContent= 'Error: No se encontró el producto o no se pudo actualizar.';
  }
}

async function AddElementRender(id,name, price) {

  const existingProducts = await window.api.getProductsID(id);

  const userList = document.getElementById('products-list');

  // Si el array tiene algo (length > 0), es porque el ID ya está ocupado
  if (existingProducts) { 
    userList.innerHTML = '';
    userList.textContent = `El ID ${id} ya pertenece a un elemento.`;
    return;
}

  const AddE = await window.api.AddElement(id, name, price);

  if (AddE){
    
    userList.innerHTML = '';
    userList.textContent = `El producto fue agregado con éxito`;
  } else {
    userList.textContent= 'Error al agregar producto.';
  }
}
/*------------------------------------------------------------------------------*/


//BUTTONS EVENTS

/*Buttos variables */
/*------------------------------------------------------------------------------*/
//button get all
const getAll = document.getElementById('getAll');

//button get whit id
const getWid = document.getElementById('getWid');

//input id for get whit id
const inputID = document.getElementById('inputID');

//input for delete
const inputFdelete = document.getElementById('inputFdelete');

//delete button
const deleteWid = document.getElementById("deleteWid");

//Update inputs
const IdUpdate = document.getElementById('UpdateId');
const NameUpdate = document.getElementById('UpdateName');
const PriceUpdate = document.getElementById('UpdatePrice');

//button Update
const ButtonUpdate = document.getElementById('UpdateButton');

//Add inputs
const IdAdd = document.getElementById('AddId');
const NameAdd = document.getElementById('AddName');
const PriceAdd = document.getElementById('AddPrice');

//button Add
const buttonAdd = document.getElementById('AddButton');
/*------------------------------------------------------------------------------*/

//EVENTS
/*------------------------------------------------------------------------------*/
//clean all with z
document.addEventListener('keydown', function(event) {
    if (event.key === 'z' || event.key === 'Z') {
        document.getElementById("products-list").textContent = "";

    }
});

//get all products
getAll.addEventListener('click', getallProducts);

//get Porducts w id
getWid.addEventListener('click', () => {
    getProductsIdRender(inputID.value);
});

//delete product
deleteWid.addEventListener('click', () =>{
  DeleteProductsRender(inputFdelete.value);
});

//Update Products
ButtonUpdate.addEventListener('click', () =>{
  UpdateProductsRender(IdUpdate.value, NameUpdate.value, PriceUpdate.value);
});

//Add Element
buttonAdd.addEventListener('click', () =>{
  AddElementRender(IdAdd.value, NameAdd.value, PriceAdd.value);
})