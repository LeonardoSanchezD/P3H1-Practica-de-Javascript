function validarFormulario() {
    var name = document.getElementById("nombre").value;
    var email = document.getElementById("correo").value;
    var cel = document.getElementById("celular").value;
    var msg = document.getElementById("mensaje").value;

    if (name === "" || email === "" || cel === "" || msg === "") {
        alert("Existen campos vacios");
        return false;
    }

    var expresionemail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!expresionemail.test(email)) {
        alert("El email no es válido");
        return false;
    }

    var expresioncel = /^\d{10}$/;
    if (!expresioncel.test(cel)) {
        alert("El número de celular debe contener solo 10 digitos!");
        return false;
    }

    alert("Gracias por contactarte con nosotros, muy pronto te responderemos");
    return true;
}
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}