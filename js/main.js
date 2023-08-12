document.querySelector(".form__auth-btn").onclick = function () {
  const userPassFirst = document.querySelector("#password1").value;
  const userPassSecond = document.querySelector("#password2").value;

  if (userPassFirst == "") {
    document.getElementById("password1").style = "border: 2px solid red";
    document.getElementById("password2").style = "border: 2px solid red";
  } else if (userPassFirst != userPassSecond) {
    document.getElementById("password1").style = "border: 2px solid red";
    document.getElementById("password2").style = "border: 2px solid red";
    return false;
  } else if (userPassFirst == userPassSecond) {
    document.getElementById("password1").style = "border: 2px solid green";
    document.getElementById("password2").style = "border: 2px solid green";
  }
  return true;
};

