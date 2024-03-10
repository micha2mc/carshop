
const cards = document.getElementById('cards');
const items = document.getElementById('items');
const pagination = document.getElementById('pagination');
const categories = document.getElementById('categories');
const itemCategoria = document.getElementById('item-categoria');
const informacionUser = document.getElementById('informacion-user');

//Carga de template
const templateCard = document.getElementById('template-card').content;
const templateCarrito = document.getElementById('template-carrito').content;
const templateFooter = document.getElementById('template-footer').content;
const templatePagination = document.getElementById('template-pagination').content;
const templateItemCategoria = document.getElementById('template-item-categoria').content;
const fragment = document.createDocumentFragment();


//Lista de objetos en el carrito
let carrito = {};
let data;
let dataFilter;
let categData;

const elementosPorPagina = 6;
let paginaActual = 1;
let filtro = null;

$(document).ready(() => {
    fetchData();

    /*if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'));
        pintarCarrito();
    }*/
});

/**
 * Zona de eventos
 */

//Detectando el evento del boton de comprar
cards.addEventListener('click', e => {
    addCarrito(e);
});

items.addEventListener('click', e => {
    btnAccion(e);
});

pagination.addEventListener('click', e => {
    paginationAccion(e);
});

categories.addEventListener('click', e => {
    typeCategories(e);
});
itemCategoria.addEventListener('click', e => {
    filtro = e.target.dataset.id;
    paginaActual = 1;
    metodoFiltradoDatos();
    paginacionTotales();
    e.stopPropagation();
});

$('#reset-categoria').click(e => {
    filtro = null;
    paginaActual = 1;
    metodoFiltradoDatos();
    paginacionTotales();
    e.stopPropagation();
});

//Modal del formulario producto
$('#formulario').submit(e => {

    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    const newData = {
        "id": parseInt(calculoIndiceMayor(data)) + 1,
        "cod": $('#cod').val(),
        "description": $('#description').val(),
        "price": parseInt($('#price').val()),
        "stock": parseInt($('#stock').val()),
        "categories": $('#categoriesForm').val().substring(0, 3).toLowerCase(),
        "image": '/assets/img/' + file.name,
    }
    data.push(newData);
    filtro = null;
    metodoFiltradoDatos();
    e.stopPropagation();
});


//Modal del formulario añadir categoria
$('#formularioCategoria').submit(e => {

    const newData = {
        "id": parseInt(calculoIndiceMayor(categData)) + 1,
        "cod": $('#name').val().substring(0, 3).toLowerCase(),
        "name": $('#name').val(),
    }
    categData.push(newData);
    pintarCategorias(categData);
    e.stopPropagation();
});




/**
 * Zona de lógica
 */
const fetchData = async () => {
    try {
        const res = await fetch('/data/apidata.json');
        const resCateg = await fetch('/data/datacategories.json');
        data = await res.json();
        categData = await resCateg.json();
        metodoFiltradoDatos();
        paginacionTotales();
        pintarCategorias(categData);

    } catch (error) {
        console.log(error);
    }
}

const metodoFiltradoDatos = () => {
    dataFilter = data;
    if (filtro !== null) {
        dataFilter = data.filter(dat => dat.categories === filtro);
    }

    let catTemp = categData.filter(cat => cat.cod === filtro);
    if (catTemp.length === 0) {
        informacionUser.querySelector('p').textContent = 'Listado de todos los Vehículos'
    } else {
        informacionUser.querySelector('p').textContent = 'Vehículos de la categoria ' + catTemp[0].name;
    }

    pintarCards();
}

//pintando objetos en la pantalla
const pintarCategorias = (categData) => {
    itemCategoria.innerHTML = '';
    categData.forEach(cat => {
        templateItemCategoria.querySelector('a').dataset.id = cat.cod;
        templateItemCategoria.querySelector('a').textContent = cat.name;
        const clone = templateItemCategoria.cloneNode(true);
        fragment.appendChild(clone);
    });

    itemCategoria.appendChild(fragment)
}
const pintarCards = () => {
    cards.innerHTML = '';
    const dataPint = datosPorPagina(paginaActual);
    dataPint.forEach(producto => {
        if (producto.description.length > 80) {
            templateCard.querySelectorAll('p')[1].textContent = producto.description.substring(0, 81) + '...';
        } else {
            templateCard.querySelectorAll('p')[1].textContent = producto.description
        }

        stockNoDisponible(producto);
        templateCard.querySelector('img').setAttribute("src", producto.image);
        templateCard.querySelectorAll('p')[0].textContent = producto.cod;

        templateCard.querySelectorAll('span')[0].textContent = producto.price;
        templateCard.querySelectorAll('span')[1].textContent = producto.stock;
        templateCard.querySelector('button').dataset.id = producto.id;

        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);

    });
    cards.appendChild(fragment);
}

const datosPorPagina = () => {
    const corteDeInicio = (paginaActual - 1) * elementosPorPagina;
    const corteDeFinal = corteDeInicio + elementosPorPagina;

    return dataFilter.slice(corteDeInicio, corteDeFinal);
}

const paginacionTotales = () => {
    const paginasTotales = Math.ceil(dataFilter.length / elementosPorPagina);
    pagination.innerHTML = '';
    if (paginasTotales > 1) {
        templatePagination.querySelector('a').textContent = 'Inicio';
        templatePagination.querySelector('a').dataset.id = 1;
        const cloneIni = templatePagination.cloneNode(true);
        fragment.appendChild(cloneIni);
        for (let i = 1; i <= paginasTotales; i++) {
            /*if (i === 1) {
                templatePagination.querySelector('li').classList.add('active');
            }*/
            templatePagination.querySelector('a').textContent = i;
            templatePagination.querySelector('a').dataset.id = i;
            const clone = templatePagination.cloneNode(true);
            fragment.appendChild(clone);
        }
        pagination.appendChild(fragment);

    }
}

/**
 * método para habilitar o deshabilitar el botón "Agregar en la cesta" según
 * la existencia del stock.
 * @param {} e 
 */

const stockNoDisponible = producto => {
    if (producto.stock <= 0) {
        templateCard.querySelector('img').style.opacity = 0.5;
        templateCard.querySelector('button').setAttribute("disabled", true);
    } else {
        templateCard.querySelector('button').removeAttribute("disabled");
        templateCard.querySelector('img').style.opacity = 1;
    }
}

//funcion para añadir objeto en el carrito que viene del evento click en el boton
const addCarrito = e => {
    if (e.target.classList.contains('btn-success')) {
        setCarrito(e.target.parentElement.parentNode.parentNode.parentNode)
    }
    e.stopPropagation();
}


//funcion para manipular objetos del carrito
const setCarrito = objeto => {
    const producto = {
        id: objeto.querySelector('.btn-success').dataset.id,
        precio: objeto.querySelectorAll('span')[0].textContent,
        cod: objeto.querySelectorAll('p')[0].textContent,
        cantidad: 1,
    }

    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }
    carrito[producto.id] = { ...producto };
    pintarCarrito();
    actualizarStock(producto.id - 1, 'SUMA');
}

//funcion para pintar el carrito
const pintarCarrito = () => {
    items.innerHTML = '';

    Object.values(carrito).forEach(item => {


        templateCarrito.querySelectorAll('td')[0].textContent = item.cod;
        templateCarrito.querySelectorAll('td')[1].textContent = item.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = item.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = item.id;
        templateCarrito.querySelector('.bi-trash3-fill').dataset.id = item.id;
        templateCarrito.querySelector('span').textContent = item.cantidad * item.precio;
        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);

    });
    items.appendChild(fragment);

    pintarFooter();

    /*localStorage.setItem('carrito', JSON.stringify(carrito));*/
}

const actualizarStock = (idData, typeOp) => {
    const dataTemp = data[idData];
    switch (typeOp) {
        case 'SUMA':
            dataTemp.stock = dataTemp.stock - 1;
            break;
        case 'RESTA':
            dataTemp.stock = dataTemp.stock + 1;
            break;
        default:
            console.log('C')

    }

    data[idData] = { ...dataTemp };
    metodoFiltradoDatos();
}


const btnAccion = e => {

    const idCarrito = e.target.dataset.id;
    //Accion de sumar cantidad de productos
    if (e.target.classList.contains('btn-info') && data[idCarrito - 1].stock >= 1) {
        const producto = carrito[idCarrito];
        producto.cantidad++;
        carrito[idCarrito] = { ...producto };
        actualizarStock(idCarrito - 1, 'SUMA')

    }

    if (e.target.classList.contains('bi-trash3-fill')) {
        const productoCar = carrito[idCarrito];
        let dataTem = data[idCarrito - 1];
        dataTem.stock = dataTem.stock + productoCar.cantidad;
        data[idCarrito - 1] = { ...dataTem };
        delete carrito[idCarrito];

    }


    //Accion de restar cantidad de productos
    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[idCarrito];

        producto.cantidad = carrito[idCarrito].cantidad - 1;
        if (producto.cantidad === 0) {
            actualizarStock(idCarrito - 1, 'RESTA');
            delete carrito[idCarrito];
        } else {
            actualizarStock(idCarrito - 1, 'RESTA');
        }
    }
    e.stopPropagation();
    pintarCarrito();
    pintarCards()
}

const pintarFooter = () => {
    footer.innerHTML = '';
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = ``;
        return;
    }

    const nPrecio = Object.values(carrito).reduce((acc, { cantidad, precio }) => acc + cantidad * precio, 0);

    templateFooter.querySelector('span').textContent = nPrecio;
    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);
    /*templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    
    */

    //boton de vaciar carrito
    /*const btnVaciarCarrito = document.getElementById('vaciar-carrito');
    btnVaciarCarrito.addEventListener('click', () => {
        carrito = {};
        pintarCarrito();
    });*/
}


const paginationAccion = e => {
    paginaActual = e.target.dataset.id;
    pintarCards();
    e.stopPropagation();
}

const typeCategories = e => {

    switch (e.target.id) {
        case 'sedan':
            filtro = 'sed';
            break;
        case 'family':
            filtro = 'fam';
            break;
        case 'suv':
            filtro = 'suv';
            break;
        default:
            filtro = null;
    }
    metodoFiltradoDatos();
    paginacionTotales();
    e.stopPropagation();
}

const calculoIndiceMayor = datosPrinc => {
    elementoMayor = datosPrinc[0].id
    for (indx in datosPrinc) {
        let elemento = datosPrinc[indx].id;
        elementoMayor = elementoMayor > elemento ? elementoMayor : elemento;
    }
    return elementoMayor;
}


