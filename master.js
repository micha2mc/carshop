
const categories = document.getElementById('categoriesItems');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Estoy')
});

categories.addEventListener('click', e => {
    menuCategorias(e);
});

const menuCategorias = e => {
    console.log(e.target)
}