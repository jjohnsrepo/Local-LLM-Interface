const button = document.getElementById("mybutton");
const input = document.getElementById("input");
const chat = document.getElementById("chat")
const unload = document.getElementById("unload")
const url = "http://127.0.0.1:1234/api/v1/chat";
let current_model
const container = document.getElementById('input-container');
const choose_button = document.getElementById("choose_button")
const model_options_container =  document.getElementById('model_options_container')
let lastResponseId = null;

async function set_model_options(){
    (choose_button.style.display="none")
    

    const data=await fetch('http://localhost:1234/api/v1/models')
    const data_parsed = await data.json()
    const available_models = data_parsed.models
    console.log("available_models",available_models)

    for(let i=0; i < available_models.length; i++){
        let model = document.createElement("div")
        model.id = `model-option-${i + 1}`
        model.className = "model-list-item"
        model.innerText=available_models[i]['key']
        model.addEventListener('click', function() {
        choose_model(this)
        })        
        model_options_container.appendChild(model)
    }
}

async function choose_model(thisoption){

    current_model = thisoption.innerText
    console.log(current_model)
    model_options_container.innerText = thisoption.innerText

}


// Helper function for the clipboard logic
async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        const originalText = button.innerText;
        button.innerText = "check_small";
        button.classList.add('copied');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.innerText = originalText;
            button.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error("Failed to copy:", err);
        alert("Clipboard access denied");
    }
}

async function send() {
    if (!current_model) {
        alert("Please select a model first");
        return;
    }

    let text = input.value.trim();
    if (text == "") {
        alert("Needs some text");
        return;
    }

    container.classList.remove('initial');
    container.classList.add('active');
    input.value = "";

    const userDiv = document.createElement("div");
    userDiv.className = "user-message";
    userDiv.textContent = text;
    chat.appendChild(userDiv);

    const body = {
        "model": current_model,
        "input": [{ "type": "text", "content": text }],
        system_prompt: 
        `You are a helpful chatbot. Return your answer in structured HTML. Never include any markdown. 
         Never use Jargon. Never assume technical knowledge.`
    };

    if (lastResponseId) body.previous_response_id = lastResponseId;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const responseData = await response.json();
        lastResponseId = responseData.response_id;
        const aiContent = responseData.output[0].content;

        const messageWrapper = document.createElement("div");
        messageWrapper.className = "ai-message-container";

        // The actual text content
        const aiResponseDiv = document.createElement("div");
        aiResponseDiv.className = "ai-content";
        aiResponseDiv.innerHTML = aiContent;

        // The Copy Button
        const copyBtn = document.createElement("span");
        copyBtn.className = "material-symbols-outlined";
        copyBtn.innerText = "copy_all";

        copyBtn.onclick = () => copyToClipboard(aiResponseDiv.innerText, copyBtn);

        // Assemble and Append
        messageWrapper.appendChild(aiResponseDiv);
        messageWrapper.appendChild(copyBtn);
        chat.appendChild(messageWrapper);

        
        // Use .innerText so we copy the text without the HTML tags
        copyBtn.onclick = () => copyToClipboard(aiResponseDiv.innerText, copyBtn);

        // Assemble and Append
        messageWrapper.appendChild(aiResponseDiv);
        messageWrapper.appendChild(copyBtn);
        chat.appendChild(messageWrapper);

        // Scroll to bottom
        chat.scrollTop = chat.scrollHeight;

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

async function unload_func() {

    if (current_model === undefined) {
        alert("No model selected");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:1234/api/v1/models/unload", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instance_id: current_model })
        });

        const data = await response.json();

        if (!response.ok) {
            // Extract LM Studio's real error message
            throw new Error(data.error.message);
        }
        console.log("Success:", data);

    } catch (error) {
        console.error("LM Studio Error:", error.message);
        alert(error.message);
    }
}


button.addEventListener('click', send);
unload.addEventListener('click', unload_func);
choose_button.addEventListener('click',set_model_options)
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") send();
});