document.getElementById("p1").innerHTML = "Hello World!";

let obj = document.getElementsByTagName("p");
console.log(obj);
for (let i = 0; i < obj.length; i++) {
  obj[i].innerHTML = "Hello World!";
}

let obj2 = document.getElementsByClassName("head1");
console.log(obj2);
for (let i = 0; i < obj2.length; i++) {
  obj2[i].innerHTML = "pp!";
}
