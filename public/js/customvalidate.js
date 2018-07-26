$(function(){
  var email =  document.getElementById("email");
  email.addEventListener("input", function (event) {
    if (email.validity.typeMismatch) {
      email.setCustomValidity("I expect an e-mail, darling!");
    } else {
      email.setCustomValidity("");
    }
  });
  console.log('validate.js');
});
