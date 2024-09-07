// Firstly, we worked on showing the input of textarea as ougoing text (using createElement, handleOutgoingChat). Just after that, we show the typing animation of 3 dots as an incoming chat (using createElement, showTypingAnimation) and then we work on API to get a response and display it as an incoming text instead of the typing animation text by replacing it (using getChatResponse). 

// After all this, we worked on making the copy button work (using copyResponse)

// Then worked on saving the chats to local storage (inside getChatResponse) and load them on pg refresh (using loadDataFromLocalStorage)

// Work on light and dark theme switcher (using themeButton.addEventListener and loadDataFromLocalStorage)

// work on automatically scrolling to the bottom if chat goes down (added same line in all the functions)

// Work on delete chat button (event listener)

// Show default text when there are no chats to show (using loadDataFromLocalStorage and handleOutgoingChat - for removing it once chat appears) and add styles to it

// Adjust textarea height to fit the content (event listener)

// Send the message using enter key and Shift+enter to go to a new line (event listener)

const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = 'AIzaSyDPLLQOBjaSlU46drlRivQfdLdNi0p-LJk';
// Store it somewhere else for security

const initialHeight = chatInput.scrollHeight;

// Loading the data from Local storage so that it can displayed even after refreshing the page
const loadDataFromLocalStorage = () => {
    const themeColor = localStorage.getItem("theme-color");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class= "default-text">
                            <h1>ChatGPT Clone</h1>
                            <p>Start a conversation and explore the power of AI.<br> Your chat history will be displayed here.</p>
                        </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;

    // Automatically scrolling to the bottom
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
}

loadDataFromLocalStorage();

const createElement = (html, className) => {
    // Creates new div and add classes = chat & specified class and set html content of div passed in the parameter
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv;
    // Return the created chatDiv
}

const getChatResponse = async (incomingChatDiv) => {
    // https://api.openai.com/v1/completions
    const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=AIzaSyDPLLQOBjaSlU46drlRivQfdLdNi0p-LJk";
    const pElement = document.createElement("p");

    // Define the properties and data for the API request
    // https://platform.openai.com/docs/api-reference/completions/create
    const requestOptions = {
        method: "POST",
        headers:{ 
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
           contents: [{
            role: "user",
            parts: [{ text: userText}] 
           }]
        })
    };

    // Send POST request to API, get response and set the response as paragraph element text
    try{
        // Send POST request to API with user's mssg
        const response = await (fetch(API_URL, requestOptions));
        const data = await response.json();
        console.log(data);
        pElement.textContent = data?.candidates[0].content.parts[0].text;
    }
     catch(error){
        // Show an error mssg if the response couldn't be generated for any reason like refreshing when the response was being generated or i put some random characters i.e p element remains empty and the chat appears blank
        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";
    }

    // Removing the typing animation , append the paragraph element 
    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);

    // Automatically scrolling to the bottom
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    // Saving all chat HTML data as all-chats name in the local storage
    localStorage.setItem("all-chats", chatContainer.innerHTML);

}

const copyResponse = (copyBtn) => {
    // Copy the text content of the response to the clipboard
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/chatbot.jpg" alt="chatbox-image">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
    
                    <span onclick = "copyResponse(this)"
                     class="material-symbols-rounded">content_copy</span>
                </div>`;

    // Create an incoming chat (classes) div with typing animation and append it to chat container
    const incomingChatDiv = createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);

    // Automatically scrolling to the bottom
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
    // Get chatInput value and remove extra spaces
    userText = chatInput.value.trim();

    if(!userText) return; 
    // If chatInput is empty return from here

    // Once a mssg is sent, make the textarea blank and set th eheight to the initial height
    chatInput.value = "";
    chatInput.style.height = `${initialHeight}px`;
    
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/user.jpg" alt="user-image">
                        <p></p>
                    </div>
                </div>`;
                // Here when there was <p>${userText}</p>, then there was a problem which was if we gave <h1>hello</h1> as input, then it's not added in the p tag rather an h1 tag is added and p remains empty and we can see hello on the screen and inside the h1

    // Create an outgoing chat (classes) div with user's message and append it to chat container
    const outgoingChatDiv = createElement(html, "outgoing");

    // The next line is added to solve the above problem
    outgoingChatDiv.querySelector("p").textContent = userText;
    // Now it is added like this <p><h1>hello</h1></p> where h1 is not a tag

    // Removes the default text once a chat appears
    document.querySelector(".default-text")?.remove();

    chatContainer.appendChild(outgoingChatDiv);

    // Automatically scrolling to the bottom
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    
    //Showing Incoming Typing Dot Animation after outgoing chat is sent
    setTimeout(showTypingAnimation, 500);
}

themeButton.addEventListener("click", () => {
    // Toggle Body's class for the theme mode
    document.body.classList.toggle("light-mode");
    // Save the theme in local storage so it doesn't change on page refresh
    localStorage.setItem("theme-color", themeButton.innerText);
    // Inner Text change so that the icon can also change sun or moon
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

deleteButton.addEventListener("click", () => {
    // Remove the chats from local storage and call loadDataFromLocalStorage function
    if(confirm("Are you sure you want to delete all the chats?")){
        localStorage.removeItem("all-chats");
        loadDataFromLocalStorage();
    }
});

chatInput.addEventListener("input", () => {
    // Adjust the height of the input field dynamically based on its content
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    // It the enter key is pressed without shift and the window width is larger than 800px (may be a phone) , handle the outgoing chat
    if(e.key === "Enter" && window.innerWidth > 800){
    e.preventDefault();
    handleOutgoingChat();
    }
});

sendButton.addEventListener("click", handleOutgoingChat);




