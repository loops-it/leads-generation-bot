// Define global variables
let chatHistory = [];
let messageDiv;
let chatWithAgent = false;
let chatTimeoutId;
let endChatAlertShown = false;
let formattedTime = "";
let intervalId;
let agentJoined = false;
let chatStatus = "bot";

// show opening time function
function setFormattedOpenedTime() {
  const OpenedTime = new Date();
  let Opendhours = OpenedTime.getHours();
  const Openedminutes = OpenedTime.getMinutes().toString().padStart(2, "0");
  const Openedseconds = OpenedTime.getSeconds().toString().padStart(2, "0");
  const Openedampm = Opendhours >= 12 ? "PM" : "AM";
  Opendhours = Opendhours % 12;
  Opendhours = Opendhours ? Opendhours : 12;
  const formattedOpenedTime = `${Opendhours.toString().padStart(
    2,
    "0"
  )}:${Openedminutes} ${Openedampm}`;

  document.getElementById("OpenedTime1").textContent = formattedOpenedTime;
}

// set time - all the visible time manage
const currentTime = new Date();
let hours = currentTime.getHours();
const minutes = currentTime.getMinutes().toString().padStart(2, "0");
const seconds = currentTime.getSeconds().toString().padStart(2, "0");
const ampm = hours >= 12 ? "PM" : "AM";
hours = hours % 12;
hours = hours ? hours : 12;
formattedTime = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;

// Call function to set the time
setFormattedOpenedTime();

// Event listener - clear localStorage items on browser refresh
window.addEventListener("beforeunload", function (event) {
  localStorage.removeItem("selectedLanguage");
  localStorage.removeItem("chatId");
});

// Function - show typing animation
function showTypingAnimation() {
  const responseDiv = document.getElementById("response");
  const typingMessage = document.createElement("div");
  typingMessage.classList.add("bot-message");
  typingMessage.innerHTML = `
              <div class="typing-animation typingmsg-wrapper">
                  <i class="bi bi-three-dots loading typing-msg"></i>
              </div>
              `;
  responseDiv.appendChild(typingMessage);
  responseDiv.scrollTop = responseDiv.scrollHeight;
}

// Function - hide typing animation
function hideTypingAnimation() {
  const typingMessage = document.querySelector(".typing-animation");
  if (typingMessage) {
    typingMessage.remove();
  }
}

// Function - handle error messages
function handleErrorMessage(error) {
  const responseDiv = document.getElementById("response");
  let errorMessage =
    "<p class='error-message'>The allocated number of tokens are over, please ask the administrator to add more tokens to the system.</p>"; // Default error message
  if (
    error.message ===
    "The allocated number of tokens are over, please ask the administrator to add more tokens to the system."
  ) {
    errorMessage =
      "<p>The allocated number of tokens are over, please ask the administrator to add more tokens to the system.</p>";
  }
  responseDiv.innerHTML = errorMessage;
}

// Function - start chat timeout 150000 (if user didn't interact within 2.5 minutes )
function startChatTimeout() {
  chatTimeoutId = setTimeout(showEndChatAlert, 150000);
}

// Function - reset chat timeout
function resetChatTimeout() {
  clearTimeout(chatTimeoutId);
  startChatTimeout();
}

// Alert - handle chat end
function showEndChatAlert() {
  if (!endChatAlertShown) {
    endChatAlertShown = true;

    const responseDiv = document.getElementById("response");
    const alertDiv = document.createElement("div");
    alertDiv.classList.add(
      "alert",
      "alert-warning",
      "alert-dismissible",
      "fade",
      "show"
    );
    alertDiv.setAttribute("role", "alert");
    alertDiv.innerHTML = `
                Parece que no has enviado ningún mensaje durante un tiempo. ¿Quieres finalizar el chat?
                <div class="d-flex flex-row">
                  <button type="button" class="btnYesToClose closeratingbot" onclick="handleEndChatBot()">Sí</button>
                  <button type="button" class="btnNotoClose ms-2" data-bs-dismiss="alert">Cancelar</button>
                </div>
            `;
    responseDiv.appendChild(alertDiv);
    alertDiv.scrollIntoView({ behavior: "smooth" });
  }
}

// Alert - handle chat end for live agent
function showEndChatAlertAgent() {
  if (!endChatAlertShown) {
    endChatAlertShown = true;

    const responseDiv = document.getElementById("response");
    const alertDiv = document.createElement("div");
    alertDiv.classList.add(
      "alert",
      "alert-warning",
      "alert-dismissible",
      "fade",
      "show"
    );
    alertDiv.setAttribute("role", "alert");
    alertDiv.innerHTML = `
                ¿Estás seguro de que deseas cerrar este chat? ¿Quieres finalizar el chat?
                <div class="d-flex flex-row">
                  <button type="button" class="btnYesToClose btn-end-chat closeRateAgent" onclick="handleEndChat()">Sí</button>
                  <button type="button" class="btnNotoClose ms-2" data-bs-dismiss="alert">Cancelar</button>
                </div>
            `;
    responseDiv.appendChild(alertDiv);
    alertDiv.scrollIntoView({ behavior: "smooth" });
  }
}

// Alert - handle chat end for chat bot
function showEndChatAlertBot() {
  if (!endChatAlertShown) {
    endChatAlertShown = true;

    const responseDiv = document.getElementById("response");
    const alertDiv = document.createElement("div");
    alertDiv.classList.add(
      "alert",
      "alert-warning",
      "alert-dismissible",
      "fade",
      "show"
    );
    alertDiv.setAttribute("role", "alert");
    alertDiv.innerHTML = `
                ¿Estás seguro de que deseas cerrar este chat? ¿Quieres finalizar el chat?
                <div class="d-flex flex-row">
                  <button type="button" class="btnYesToClose abc btn-end-chat" onclick="handleEndChatBot()" >Sí</button>
                  <button type="button" class="btnNotoClose ms-2" data-bs-dismiss="alert">Cancelar</button>
                </div>
            `;
    responseDiv.appendChild(alertDiv);
    alertDiv.scrollIntoView({ behavior: "smooth" });
  }
}

// Function - start rating
function handleEndChatBot() {
  showAlertSuccess("Gracias por chatear con nosotras.");
}

// Function - handle ending the chat
function handleEndChat() {
  clearTimeout(chatTimeoutId);

  appendMessageToResponse(
    "bot",
    "Please rate your chat experience:",
    null,
    true
  );
}

// Function - append message to response div
function appendMessageToResponse(role, content, data, isRatingForm = false) {
  const responseDiv = document.getElementById("response");

  const messageDiv = createMessageDiv(isRatingForm ? "rate" : role, content);
  const image = createMessageImage(isRatingForm ? "rate" : role);

  if (isList(content)) {
    appendListContent(messageDiv, content);
  } else if (
    content.includes(
      "Se seleccionará el agente de marketing."
    )
  ) {
    appendLiveAgentContent(messageDiv, content, data);
  } else {
    appendPlainTextContent(messageDiv, content);
  }

  if (isRatingForm) {
    // appendRatingForm(messageDiv);
    const chatId = localStorage.getItem("chatId");
    appendRatingForm(messageDiv, chatId);
  }

  resetChatTimeout();

  messageDiv.prepend(image);
  responseDiv.appendChild(messageDiv);
  responseDiv.scrollTop = responseDiv.scrollHeight;
}

function createMessageDiv(role, content) {
  const messageDiv = document.createElement("div");

  // Add class based on the role
  if (role === "user") {
    messageDiv.classList.add("user-message");
  } else if (role === "bot") {
    messageDiv.classList.add("bot-message");
  } else if (role === "product") {
    messageDiv.classList.add("product-message");
  } else if (role === "quickQuestion") {
    messageDiv.classList.add("user-message");
  } else if (role === "quickAnswer") {
    messageDiv.classList.add("bot-message");
  } else if (role === "liveagent") {
    messageDiv.classList.add("bot-message");
  } else if (role === "rate") {
    messageDiv.classList.add("rate-message");
  }

  messageDiv.textContent = content;

  return messageDiv;
}

// Function - handle image based on role
function createMessageImage(role) {
  const image = document.createElement("img");
  image.classList.add("message-image");
  image.src = role === "user" ? "/user.webp" : "/agent.png";
  return image;
}

// Function - handle list view (chat bot)
function isList(content) {
  const listRegex = /^\d+\.\s.*$/gm;
  return listRegex.test(content);
}
function appendListContent(messageDiv, content) {
  const listItems = content
    .split("\n")
    .map((item) => `<li style="margin-bottom: 10px !important;">${item}</li>`)
    .join("");
  messageDiv.innerHTML = `<div class="messageWrapper">
      <span class="botname-message">${formattedTime}</span>
      <div>
        <ul style="list-style: none; padding: 0px !important">${listItems}</ul>
      </div>
    </div>`;
}

// Function - handle live agent messages
function appendLiveAgentContent(messageDiv, content, data) {
  const formattedTime = new Date().toLocaleTimeString(); // Assuming you have a way to format time
  messageDiv.innerHTML = `<div class="messageWrapper">
      <span class="botname-message">${formattedTime}</span>
      <div class="d-flex flex-column">
        <input type="text" placeholder="Su nombre" id="title" class="mb-2 p-1 formLegalCRM">
        <input type="tel" placeholder="Número de teléfono" id="phone" class="mb-2 p-1 formLegalCRM">
        <input type="email" name="email" placeholder="Dirección de correo electrónico" id="email" class="mb-2 p-1 formLegalCRM">
        <input type="text" name="message" placeholder="mensaje" id="message" class="mb-2 p-1 formLegalCRM">
        <button id="LiveAgentButton" class="liveagentBtn">Entregar</button>
        <div>${content}</div>
      </div>
    </div>`

  const liveAgentButton = messageDiv.querySelector("#LiveAgentButton");
  liveAgentButton.addEventListener("click", handleLiveAgentButtonClick(data));
}

function handleLiveAgentButtonClick(data) {
  return async function () {
    const title = document.getElementById("title").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const description = document.getElementById("message").value;
    const leadValue = 0;

    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!phonePattern.test(phone)) {
      showAlert("Por favor ingrese un número de teléfono válido (10 dígitos).");
      return;
    }
    if (!emailPattern.test(email)) {
      showAlert("Por favor ingrese una dirección de correo electrónico válida.");
      return;
    }

    const payload = {
      title: title,
      phone: phone,
      email: email,
      description: description,
      lead_value: leadValue,
    };

    try {
      const response = await fetch("https://projects.genaitech.dev/crm-demo/api/create-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("API response:", responseData);

      if (response.ok) {
        // Handle successful response
        showAlert(" ¡Prospecto creado exitosamente!");
        document.getElementById("title").value = '';
        document.getElementById("email").value = '';
        document.getElementById("phone").value = '';
        document.getElementById("message").value = '';
      } else {
        // Handle error response
        showAlert("Error al crear cliente potencial: " + responseData.message);
      }
    } catch (error) {
      console.error("Error sending lead data:", error);
      showAlert("Ocurrió un error. Inténtalo de nuevo más tarde.");
    }
  };
}


// function handleLiveAgentButtonClick(data) {
//   return async function () {
//     try {
//       const switchResponse = await fetch("/switch-to-live-agent", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ chatId: data.chatId }),
//       });
//       const dataSwitchAgent = await switchResponse.json();
//       console.log("switch res : ", dataSwitchAgent);
//       if (dataSwitchAgent.status === "success") {
//         showAlert("One of our agents will join you soon. Please stay tuned.");
//         chatWithAgent = true;
//         startCheckingForAgent(data);
//       } else {
//         // Show offline form
//         showOfflineForm();
//       }
//     } catch (error) {
//       console.error("Error switching to live agent:", error);
//     }
//   };
// }

function showOfflineForm() {
  const responseDiv = document.getElementById("response");
  const offlineForm = document.createElement("div");
  offlineForm.innerHTML = `
          <div class='bot-message'>
              <div class="p-2 messageSubmitForm">
              <div>Our agents are offline. Please submit your message:</div>
              <form id="offlineForm">
                  <div class="mb-3">
                      <label for="name" class="form-label">Su nombre</label>
                      <input type="text" class="form-control" id="name" required>
                  </div>
                  <div class="mb-3">
                      <label for="email" class="form-label">Correo electrónico</label>
                      <input type="email" class="form-control" id="email" required>
                  </div>
                  <div class="mb-3">
                      <label for="subject" class="form-label">Título</label>
                      <input type="text" class="form-control" id="subject" required>
                  </div>
                  <div class="mb-3">
                      <label for="message" class="form-label">Mensaje</label>
                      <textarea class="form-control" id="message" rows="3" required></textarea>
                  </div>
                  <button type="submit" class="btnNotoClose">Entregar</button>
              </form>
          </div>
      </div>
      `;
  responseDiv.appendChild(offlineForm);

  // Scroll to the form
  offlineForm.scrollIntoView({ behavior: "smooth", block: "end" });

  // Add event listener for form submission
  const offlineFormElement = document.getElementById("offlineForm");
  offlineFormElement.addEventListener("submit", handleOfflineFormSubmission);
}

async function handleOfflineFormSubmission(event) {
  event.preventDefault();

  const chatId = localStorage.getItem("chatId");
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;

  try {
    const response = await fetch("/live-chat-offline-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatId, name, email, subject, message }),
    });

    if (response.ok) {
      showAlert(
        "Su mensaje ha sido enviado con éxito. Nuestro equipo se pondrá en contacto con usted en breve."
      );
    } else {
      showAlert("No se pudo enviar su mensaje. Inténtelo nuevamente más tarde.");
    }
  } catch (error) {
    console.error("Error submitting offline form:", error);
    showAlert(
      "Se produjo un error al enviar su mensaje. Inténtelo nuevamente más tarde."
    );
  }
}

function startCheckingForAgent(data) {
  intervalId = setInterval(async () => {
    try {
      // if (chatStatus === "null"){
      const response = await fetch("/live-chat-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId: data.chatId }),
      });

      const dataLiveAgent = await response.json();
      console.log("response Data agent --: ", dataLiveAgent);

      if (response.ok) {
        console.log("responseData agent: ", dataLiveAgent);
        chatStatus = dataLiveAgent.chat_status;
        if (dataLiveAgent.chat_status === "live") {
          console.log("response.status - ", dataLiveAgent.chat_status);
          if (dataLiveAgent.agent_id !== "unassigned") {
            if (!agentJoined) {
              showAlert(
                "Ahora estás chateando con el ID del agente:" +
                dataLiveAgent.agent_name
              );
              agentJoined = true;
              chatWithAgent = true;
            }
            appendMessageToResponse(
              "liveagent",
              dataLiveAgent.agent_message,
              data
            );
          }
        } else if (dataLiveAgent.chat_status === "closed") {
          console.log("response.status failed - ", dataLiveAgent.chat_status);
          handleEndChat();
          clearInterval(intervalId); // Stop sending requests if the chat is closed
        }
      }
      // }
    } catch (error) {
      console.error("Error fetching products data:", error);
    }
  }, 5000);

  setTimeout(() => {
    clearInterval(intervalId);
    if (!agentJoined) {
      showAlert("Todos los agentes están ocupados. Inténtelo nuevamente más tarde.");
      console.log("No hay agentes disponibles. Llamada API detenida.");
    }
  }, 120000);
}

async function chatCloseByUser() {
  if (agentJoined === true) {
    const chatId = localStorage.getItem("chatId");
    const response = await fetch("/close-live-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatId: chatId }),
    });

    const dataChatClose = await response.json();
    console.log("Data Chat Close --: ", dataChatClose);
    if (dataChatClose.status === "success") {
      showEndChatAlertAgent();
    }
  } else {
    console.log("Chat bot doesn't have rating...");
    showEndChatAlertBot();
  }
}

function appendPlainTextContent(messageDiv, content) {
  messageDiv.innerHTML = `<div class="messageWrapper">
                              <span class="botname-message">${formattedTime}</span>
                              <div>
                              <p class="mb-0">${content}</p>
                              </div>
                          </div>`;
}

function appendRatingForm(messageDiv) {
  const ratingFormHTML = `
          <div class="star-rating-form d-flex flex-column px-2 py-3 mt-3" style="margin-bottom: 10px;">
            <label for="rating">Califica tu experiencia:</label>
            <div class="rating-icons d-flex flex-row" style="border: none !important;">
              <i class="bi bi-star rating-icon"></i>
              <i class="bi bi-star rating-icon"></i>
              <i class="bi bi-star rating-icon"></i>
              <i class="bi bi-star rating-icon"></i>
              <i class="bi bi-star rating-icon"></i>
            </div>
            <input type="hidden" id="rating" name="rating" value="0">
            <textarea type="text" id="feedbackMessage" name="feedbackMessage" class="feedbackMessage mb-2"></textarea>
            <button id="submitRatingButton" class="btnRatingView" onclick="handleRatingSubmission()">Entregar</button>
          </div>
        `;

  messageDiv.innerHTML = `<div class="messageWrapper">
        <span class="botname-message">${formattedTime}</span>
        <div class="ratingFormTest">
          <p class="mb-0">Por favor califica tu experiencia en el chat:</p>
        </div>
        ${ratingFormHTML}
      </div>`;

  // messageDiv.innerHTML += ratingFormHTML;

  addRatingIconEventListeners(messageDiv);
}

function addRatingIconEventListeners(messageDiv) {
  const ratingIcons = messageDiv.querySelectorAll(".rating-icon");
  ratingIcons.forEach((icon, index) => {
    icon.addEventListener("click", handleRatingIconClick(messageDiv, index));
  });
}

function handleRatingIconClick(messageDiv, index) {
  return function () {
    const ratingInput = messageDiv.querySelector("#rating");
    ratingInput.value = index + 1;
    const ratingIcons = messageDiv.querySelectorAll(".rating-icon");
    ratingIcons.forEach((star, i) => {
      star.classList.toggle("bi-star-fill", i <= index);
    });
  };
}

function showAlert(message) {
  const responseDiv = document.getElementById("response");
  const alertDiv = document.createElement("div");
  alertDiv.classList.add(
    "alert",
    "alert-warning",
    "alert-dismissible",
    "fade",
    "show",
    "me-2"
  );
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
  responseDiv.appendChild(alertDiv);
  alertDiv.scrollIntoView({ behavior: "smooth" });
}

function showAlertSuccess(message) {
  const responseDiv = document.getElementById("response");
  const alertDiv = document.createElement("div");
  alertDiv.classList.add(
    "alert",
    "alert-success",
    "alert-dismissible",
    "fade",
    "show",
    "me-2"
  );
  alertDiv.setAttribute("role", "alert");
  alertDiv.innerHTML = `
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
  responseDiv.appendChild(alertDiv);
  alertDiv.scrollIntoView({ behavior: "smooth" });
}

function appendLanguageMessage(content) {
  const responseDiv = document.getElementById("response");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("bot-message");

  const image = document.createElement("img");
  image.classList.add("message-image");
  image.src = "/agent.png";

  messageDiv.innerHTML = `<div class="messageWrapper">
      <span class="botname-message">${formattedTime}</span>
      <div>
        <p class="mb-0">${content}</p>
      </div>
    </div>`;
  messageDiv.prepend(image);

  responseDiv.appendChild(messageDiv);
  // Scroll down to the latest message
  responseDiv.scrollTop = responseDiv.scrollHeight;
}

// Event listener - question form submission
document
  .getElementById("questionForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const questionInput = document.getElementById("question");
    const question = questionInput.value;

    const selectedLanguageLocal = localStorage.getItem("selectedLanguage");
    chatHistory.push({ role: "user", content: question });

    appendMessageToResponse("user", question);

    let selectedLanguage;
    if (selectedLanguageLocal === "Singlish") {
      selectedLanguage = "Sinhala";
    } else if (selectedLanguageLocal === "Tanglish") {
      selectedLanguage = "Tamil";
    } else {
      selectedLanguage = selectedLanguageLocal;
    }

    console.log("selected Language:", selectedLanguage);

    let chatId = localStorage.getItem("chatId");
    const requestBody = {
      chatId: chatId,
      messages: chatHistory,
      language: selectedLanguage || "English",
    };
    const requestBodyAgent = {
      chatId: chatId,
      user_message: question,
      language: selectedLanguage || "English",
    };

    if (chatWithAgent === false) {
      const submitButton = document.querySelector(".chat-submit-button");
      submitButton.innerHTML = '<i class="bi bi-three-dots loading"></i>';
      submitButton.disabled = true;

      // Hide record button
      document.getElementById("startRecording").style.display = "none";
      document.getElementById("questionForm").style.width = "100%";

      try {
        // Clear the input
        questionInput.value = "";
        const response = await fetch("/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        // Update chat history
        chatHistory = data.chatHistory || [];

        if (!localStorage.getItem("chatId")) {
          localStorage.setItem("chatId", data.chatId);
          console.log("id: ", data.chatId);
        }
        if (data.answer !== null) {
          appendMessageToResponse("bot", data.answer, data);
        }

        // Show record button
        document.getElementById("startRecording").style.display = "block";
        document.getElementById("questionForm").style.width = "85%";
      } catch (error) {
        console.error("Error submitting question:", error);
        // Handle error message
        handleErrorMessage(error);
      } finally {
        // Re-enable input field and submit button
        questionInput.disabled = false;
        submitButton.innerHTML = '<i class="bi bi-send-fill"></i>';
        submitButton.disabled = false;
      }
    } else {
      const responseLiveAgent = await fetch("/live-chat-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBodyAgent),
      });

      const liveAgentData = await responseLiveAgent.json();
      chatHistory = liveAgentData.chatHistory || [];
    }
  });

// Audio recording function
// let mediaRecorder;
// let audioChunks = [];
// let currentAudio = null;

// // Function to stop current audio
// function stopSpeaking() {
//   if (currentAudio) {
//     currentAudio.pause();
//     currentAudio.currentTime = 0;
//   }
//   responsiveVoice.cancel();
//   document.getElementById("stopSpeaking").style.display = "none";
//   document.getElementById("startRecording").style.display = "block";
// }

// document.getElementById("stopSpeaking").addEventListener("click", stopSpeaking);

// // Function to handle starting the recording
// async function startRecording() {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     mediaRecorder = new MediaRecorder(stream);

//     mediaRecorder.ondataavailable = (event) => {
//       audioChunks.push(event.data);
//     };

//     mediaRecorder.onstop = async () => {
//       const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
//       audioChunks = [];

//       const selectedLanguageLocal = localStorage.getItem("selectedLanguage");

//       let selectedLanguage;
//       if (selectedLanguageLocal === "Singlish") {
//         selectedLanguage = "Sinhala";
//       } else if (selectedLanguageLocal === "Tanglish") {
//         selectedLanguage = "Tamil";
//       } else {
//         selectedLanguage = selectedLanguageLocal;
//       }

//       const formData = new FormData();
//       formData.append("audio", audioBlob);
//       formData.append("language", selectedLanguage);

//       try {
//         const response = await fetch("/recording-start", {
//           method: "POST",
//           body: formData,
//         });

//         const transcript = await response.json();
//         appendMessageToResponse("user", transcript.text);
//         chatHistory.push({ role: "user", content: transcript.text });
//         showTypingAnimation();

//         let chatId = localStorage.getItem("chatId");

//         const responseAnswer = await fetch("/voice-chat-response", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             transcript: transcript.text,
//             chatId: chatId,
//             messages: chatHistory,
//             language: selectedLanguage || "English",
//           }),
//         });

//         const botAnswer = await responseAnswer.json();
//         console.log("bot answer : ", botAnswer)

//         if (!localStorage.getItem("chatId")) {
//           localStorage.setItem("chatId", botAnswer.chatId);

//         }
//         if (botAnswer.answer !== null) {
//           appendMessageToResponse("bot", botAnswer.answer, botAnswer);

//           if (botAnswer.audioSrc === null) {
//             responsiveVoice.speak(botAnswer.answer, selectedLanguage, { volume: 1 });
//             document.getElementById("stopSpeaking").style.display = "block";
//             document.getElementById("startRecording").style.display = "none";
//             responsiveVoice.onend = () => {
//               stopSpeaking();
//             };
//           }
//           else if (botAnswer.audioSrc) {
//             currentAudio = new Audio(botAnswer.audioSrc);
//             currentAudio.play();
//             document.getElementById("stopSpeaking").style.display = "block";
//             document.getElementById("startRecording").style.display = "none";
//             currentAudio.onended = () => {
//               stopSpeaking();
//             };
//           }
//           // document.getElementById("stopSpeaking").style.display = "none";
//         }
//         hideTypingAnimation();
//       } catch (error) {
//         console.error("Error fetching transcript:", error);
//       } finally {
//         // Show input and send button after sending the recording
//         document.getElementById("question").style.display = "block";
//         document.querySelector(".chat-submit-button").style.display = "block";
//         document.getElementById("startRecording").style.display = "block";
//       }
//     };

//     mediaRecorder.start();

//     // Change the icon to indicate recording
//     document
//       .getElementById("startRecordingIcon")
//       .classList.remove("bi-mic-fill");
//     documents
//       .getElementById("startRecordingIcon")
//       .classList.add("bi-mic-mute-fill");
//     // Hide input and send button when recording starts
//     document.getElementById("question").style.display = "none";
//     document.querySelector(".chat-submit-button").style.display = "none";
//   } catch (error) {
//     console.error("Error accessing microphone:", error);
//   }
// }

// // Function to handle stopping the recording
// function stopRecording() {
//   if (mediaRecorder && mediaRecorder.state !== "inactive") {
//     mediaRecorder.stop();
//     // Revert the icon back to the original state
//     document
//       .getElementById("startRecordingIcon")
//       .classList.remove("bi-mic-mute-fill");
//     document.getElementById("startRecordingIcon").classList.add("bi-mic-fill");
//   }
// }

// // Event listeners for the recording button
// document
//   .getElementById("startRecording")
//   .addEventListener("mousedown", startRecording);
// document
//   .getElementById("startRecording")
//   .addEventListener("mouseup", stopRecording);
// document
//   .getElementById("startRecording")
//   .addEventListener("touchstart", (e) => {
//     e.preventDefault();
//     startRecording();
//   });
// document.getElementById("startRecording").addEventListener("touchend", (e) => {
//   e.preventDefault();
//   stopRecording();
// });

// document.getElementById("question").addEventListener("input", () => {
//   document.getElementById("startRecording").style.display = "none";
//   document.getElementById("questionForm").style.width = "100%";
// });
// document.getElementById("box1").addEventListener("input", () => {
//   document.getElementById("startRecording").style.display = "none";
//   document.getElementById("questionForm").style.width = "100%";
// });
// document.getElementById("box2").addEventListener("input", () => {
//   document.getElementById("startRecording").style.display = "none";
//   document.getElementById("questionForm").style.width = "100%";
// });

let mediaRecorder;
let audioChunks = [];
let currentAudio = null;
let isRecordingInProgress = false;

// Function to stop current audio
function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  responsiveVoice.cancel();
  document.getElementById("stopSpeaking").style.display = "none";
  document.getElementById("startRecording").style.display = "block";
  document.getElementById("startRecording").disabled = false;
  document
    .getElementById("startRecordingIcon")
    .classList.remove("bi-three-dots", "loading");
  document.getElementById("startRecordingIcon").classList.add("bi-mic-fill");
  isRecordingInProgress = false;
}

document.getElementById("stopSpeaking").addEventListener("click", stopSpeaking);

// Function to handle starting the recording
async function startRecording() {
  if (isRecordingInProgress) return;
  isRecordingInProgress = true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      audioChunks = [];

      const selectedLanguageLocal = localStorage.getItem("selectedLanguage");

      let selectedLanguage;
      if (selectedLanguageLocal === "Singlish") {
        selectedLanguage = "Sinhala";
      } else if (selectedLanguageLocal === "Tanglish") {
        selectedLanguage = "Tamil";
      } else {
        selectedLanguage = selectedLanguageLocal;
      }

      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("language", selectedLanguage);

      try {
        const response = await fetch("/recording-start", {
          method: "POST",
          body: formData,
        });

        const transcript = await response.json();
        appendMessageToResponse("user", transcript.text);
        chatHistory.push({ role: "user", content: transcript.text });
        showTypingAnimation();

        // Disable startRecording button and change icon
        document.getElementById("startRecording").disabled = true;
        document
          .getElementById("startRecordingIcon")
          .classList.remove("bi-mic-fill");
        document
          .getElementById("startRecordingIcon")
          .classList.add("bi-three-dots", "loading");

        let chatId = localStorage.getItem("chatId");

        const responseAnswer = await fetch("/voice-chat-response", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript: transcript.text,
            chatId: chatId,
            messages: chatHistory,
            language: selectedLanguage || "English",
          }),
        });

        const botAnswer = await responseAnswer.json();
        console.log("bot answer : ", botAnswer);

        if (!localStorage.getItem("chatId")) {
          localStorage.setItem("chatId", botAnswer.chatId);
        }
        if (botAnswer.answer !== null) {
          appendMessageToResponse("bot", botAnswer.answer, botAnswer);
          // console.log("botAnswer.audioSrc : ",botAnswer.audioSrc)

          if (botAnswer.audioSrc === null) {
            // responsiveVoice.speak(botAnswer.answer, selectedLanguage, { volume: 1 });
            // responsiveVoice.onstart = () => {
            //     document.getElementById("startRecording").style.display = "none";
            //     document.getElementById("stopSpeaking").style.display = "block";
            // };
            // responsiveVoice.onend = () => {
            //     stopSpeaking();
            // };
            document.getElementById("startRecording").style.display = "none";
            document.getElementById("stopSpeaking").style.display = "block";
            responsiveVoice.speak(botAnswer.answer, selectedLanguage, {
              volume: 1,
            });
            document.getElementById("stopSpeaking").style.display = "block";
            document.getElementById("startRecording").style.display = "none";
            responsiveVoice.onend = () => {
              stopSpeaking();
            };
          } else if (botAnswer.audioSrc) {
            currentAudio = new Audio(botAnswer.audioSrc);
            currentAudio.play();
            currentAudio.onplay = () => {
              document.getElementById("startRecording").style.display = "none";
              document.getElementById("stopSpeaking").style.display = "block";
            };
            currentAudio.onended = () => {
              stopSpeaking();
            };
          }
        }
        hideTypingAnimation();
      } catch (error) {
        console.error("Error fetching transcript:", error);
        stopSpeaking();
      }
    };

    mediaRecorder.start();

    // Change the icon to indicate recording
    document
      .getElementById("startRecordingIcon")
      .classList.remove("bi-mic-fill");
    document
      .getElementById("startRecordingIcon")
      .classList.add("bi-mic-mute-fill");
    // Hide input and send button when recording starts
    document.getElementById("question").style.display = "none";
    document.querySelector(".chat-submit-button").style.display = "none";
  } catch (error) {
    console.error("Error accessing microphone:", error);
    isRecordingInProgress = false; // Reset the flag in case of error
  }
}

// Function to handle stopping the recording
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    // Revert the icon back to the original state
    document
      .getElementById("startRecordingIcon")
      .classList.remove("bi-mic-mute-fill");
    document.getElementById("startRecordingIcon").classList.add("bi-mic-fill");
  }
}

// Event listeners for the recording button
document
  .getElementById("startRecording")
  .addEventListener("mousedown", startRecording);
document
  .getElementById("startRecording")
  .addEventListener("mouseup", stopRecording);
document
  .getElementById("startRecording")
  .addEventListener("touchstart", (e) => {
    e.preventDefault();
    startRecording();
  });
document.getElementById("startRecording").addEventListener("touchend", (e) => {
  e.preventDefault();
  stopRecording();
});

document.getElementById("question").addEventListener("input", () => {
  document.getElementById("startRecording").style.display = "none";
  document.getElementById("questionForm").style.width = "100%";
});
document.getElementById("box1").addEventListener("input", () => {
  document.getElementById("startRecording").style.display = "none";
  document.getElementById("questionForm").style.width = "100%";
});
document.getElementById("box2").addEventListener("input", () => {
  document.getElementById("startRecording").style.display = "none";
  document.getElementById("questionForm").style.width = "100%";
});

// Event listener for language change to english
document
  .getElementById("changeToEnglishButton")
  .addEventListener("click", function () {
    document.getElementById("box1").style.display = "none";
    document.getElementById("box2").style.display = "none";
    localStorage.setItem("selectedLanguage", "English");
    appendLanguageMessage("Please ask your question in English.");
  });

// Event listener for language change to sinhala
document
  .getElementById("changeToSinhalaButton")
  .addEventListener("click", function () {
    document.getElementById("box1").style.display = "none";
    document.getElementById("box2").style.display = "none";
    localStorage.setItem("selectedLanguage", "Sinhala");
    appendLanguageMessage("කරුණාකර ඔබේ ප්‍රශ්නය සිංහලෙන් අසන්න.");
  });

// Event listener for language change to tamil
document
  .getElementById("changeToTamilButton")
  .addEventListener("click", function () {
    document.getElementById("box1").style.display = "none";
    document.getElementById("box2").style.display = "none";
    localStorage.setItem("selectedLanguage", "Tamil");
    appendLanguageMessage("உங்கள் கேள்வியை தமிழில் கேளுங்கள்.");
  });

document
  .getElementById("changeToSinglish")
  .addEventListener("click", function () {
    document.getElementById("box1").style.display = "block";
    document.getElementById("box2").style.display = "none";
    document.getElementById("question").style.display = "block";
    localStorage.setItem("selectedLanguage", "Singlish");
    appendLanguageMessage("කරුණාකර ඔබේ ප්‍රශ්නය සිංහලෙන් අසන්න.");
  });

document
  .getElementById("changeToTanglish")
  .addEventListener("click", function () {
    document.getElementById("box1").style.display = "none";
    document.getElementById("box2").style.display = "block";
    document.getElementById("question").style.display = "block";
    localStorage.setItem("selectedLanguage", "Tanglish");
    appendLanguageMessage("உங்கள் கேள்வியை தமிழில் கேளுங்கள்.");
  });

// ===============================================
// ================ rating =======================
// ===============================================
async function handleRatingSubmission() {
  const ratingInput = document.getElementById("rating");
  const rating = ratingInput.value;
  const feedbackMessageInput = document.getElementById("feedbackMessage");
  const feedbackMessage = feedbackMessageInput.value;
  const chatId = localStorage.getItem("chatId");

  try {
    const response = await fetch("/save-rating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ratingValue: rating,
        feedbackMessage: feedbackMessage,
        chatId: chatId,
      }),
    });

    if (response.ok) {
      // Show thank you message for feedback
      const responseDiv = document.getElementById("response");
      const thankYouDiv = document.createElement("div");
      thankYouDiv.classList.add(
        "alert",
        "alert-success",
        "alert-dismissible",
        "fade",
        "show"
      );
      thankYouDiv.setAttribute("role", "alert");
      thankYouDiv.textContent = "Thank you for your feedback!";
      responseDiv.appendChild(thankYouDiv);
      thankYouDiv.scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    console.error("Error submitting rating:", error);
    // Handle error
  }
}

// Add event listeners - for rating icons
function addRatingIconEventListeners(messageDiv) {
  const ratingIcons = messageDiv.querySelectorAll(".rating-icon");
  ratingIcons.forEach((icon, index) => {
    icon.addEventListener("click", () => {
      // Set the rating value based on the index of the clicked star icon
      const ratingInput = document.getElementById("rating");
      ratingInput.value = index + 1;

      // Highlight the selected star and unhighlight the rest
      ratingIcons.forEach((star, i) => {
        if (i <= index) {
          star.classList.add("bi-star-fill");
          star.classList.remove("bi-star");
        } else {
          star.classList.remove("bi-star-fill");
          star.classList.add("bi-star");
        }
      });
    });
  });
}

addRatingIconEventListeners(messageDiv);
