import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form"); //on rentre l'id afin de choper l'élement dom
const chatContainer = document.querySelector("#chat_container"); // pareil ici avec la div qui contiendras le chat.

let loadInterval; // variable qui va contenir nos petits points de loading

function loader(element) {
  //fonction qui permettra d'afficher des petits points pendant que l'ia réfléchis
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
    }
  }, 300); // toutes les 300 millisecondes on ajoute un points, si il y'a 4 points on resets.
}

function typeText(element, text) {
  // fonction qui permettras a l'ia de taper sa réponse lettre par lettre
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      // test pour savoir l'ia est toujours en train de taper sa réponse
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20); // donc toutes les 20 millisecondes on va afficher une lettre de la réponse de l'IA, dès qu'il n'y a plus de lettre on clear l'interval
}

function generateUniqueId() {
  // on va générer un id unique pour chaque réponse de l'ia
  const timestamp = Date.now(); //retourne le nombre de millisecondes écoulées depuis le 1er janvier 1970
  const randomNumber = Math.random(); // donne un nombre aléatoire entre 0 et 1 exclus
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  /* Fonction nous permettant d'afficher le chat, avec une couleur différente 1 fois sur 2 et une image spécifique si c'est l'ia qui parle ou si c'est un user */
  return `
  <div class="wrapper ${isAi && "ai"}">
  <div class="chat">
      <div class="profile">
          <img 
            src=${isAi ? bot : user} 
            alt="${isAi ? "bot" : "user"}" 
          />
      </div>
      <div class="message" id=${uniqueId}>${value}</div>
  </div>
</div>
    `;
}

const handleSubmit = async (e) => {
  //fonction permettant de gérer la question posé par l'user
  e.preventDefault(); // permet de ne pas rafraichir la page après avoir submit notre event ( un form dans notre cas)
  const data = new FormData(form); // on envoie notre form a FormData afin de pouvoir utiliser les méthodes associés
  // chat de l'utilisateur :
  chatContainer.innerHTML += chatStripe(
    false,
    data.get("prompt")
  ); /* on appelle chatstripe en lui faisant comprendre que c'est l'utilisateur qui envoie la requete, et on affiche dans le dom
  on appelle la méthode get de form data qui permet de récupérer la valeur de prompt (l'id de notre textarea) et de le donner a chat stripe*/
  form.reset();
  //chat de l'IA
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId); // on call chatStripe avec le string qui va se faire fill le true et l'id

  chatContainer.scrollTop = chatContainer.scrollHeight; //permet de déplacer la vue du haut du chat vers la totalité de la hauteur
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  const response = await fetch("httpps://rabah-chatgpt-openai.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";
  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};
form.addEventListener("submit", handleSubmit); // si on appuie sur submit on envoie le form
form.addEventListener("keyup", (e) => {
  // si on appuie sur entrée on envoie le form
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
