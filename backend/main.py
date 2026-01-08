from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from config import settings
from rag import initialize_chroma, get_context_for_query
from openai.types.chat import ChatCompletionMessageParam
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("start")
    initialize_chroma()
    yield
    print("shut down")

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=settings.OPENAI_API_KEY)

conversation_history:list[ChatCompletionMessageParam] = [{"role":"system","content":"you are an assistant"}]

class ChatRequest(BaseModel):
    message:str
   
@app.post("/chat")
def Chat(req:ChatRequest):
    # 1. Get context from RAG
    rag_context = get_context_for_query(req.message)
    print(f"RAG Context:\n{rag_context}")
    
    # 2. Combine RAG context with user message
    enhanced_message = f"{rag_context}\n\nUser Question: {req.message}"
    
    # 3. Add to conversation history
    conversation_history.append({"role":"user","content":enhanced_message})
    
    # 4. Get response from ChatGPT
    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=conversation_history
    )
    
    # 5. Extract reply
    reply = response.choices[0].message.content
    
    # 6. Store assistant response in history
    conversation_history.append({"role":"assistant","content":reply})
    
    # 7. Return response
    return {"reply":reply}


@app.get("/")
def get():
    return {"detail":"Hi How are you"}