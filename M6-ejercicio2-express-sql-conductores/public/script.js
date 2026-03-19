function cargarConductores(){

fetch('/conductores')
.then(res => res.json())
.then(data => {

let tabla = document.getElementById("tablaConductores");
tabla.innerHTML = "";

data.forEach(conductor => {

tabla.innerHTML += `
<tr>

<td>${conductor.nombre}</td>
<td>${conductor.edad}</td>
</tr>
`;

});

});

}
