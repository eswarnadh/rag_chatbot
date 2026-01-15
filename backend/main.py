from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from config import settings
from rag import initialize_chroma, get_context_for_query
from openai.types.chat import ChatCompletionMessageParam, ChatCompletionToolParam
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

conversation_history: list = [{"role":"system","content":"you are an assistant"}]

class ChatRequest(BaseModel):
    message:str


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document to the docs folder and process it
    """
    # 0. Check if filename exists
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Filename is required"
        )
    
    # 1. Validate file type
    allowed_extensions = ['.txt', '.pdf', '.docx', '.xlsx', '.xls']
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File type {file_extension} not supported. Allowed: {allowed_extensions}"
        )
    
    # 2. Validate file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB in bytes
    file.file.seek(0, 2)  # Move to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset
    
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({file_size} bytes). Max size: 10MB"
        )
    
    # 3. Define save path
    docs_path = Path(__file__).parent / "docs"
    docs_path.mkdir(exist_ok=True)
    
    file_path = docs_path / file.filename
    
    # 4. Check if file already exists
    if file_path.exists():
        raise HTTPException(
            status_code=400,
            detail=f"File '{file.filename}' already exists. Please rename or delete the existing file."
        )
    
    # 5. Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"File saved: {file_path}")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error saving file: {str(e)}"
        )
    
    # 6. Process the document (add to vector DB)
    try:
        from rag import process_new_document
        result = process_new_document(str(file_path))
        
        return {
            "success": True,
            "message": "File uploaded and processed successfully",
            "filename": file.filename,
            "size_bytes": file_size,
            "chunks_created": result["chunks"],
            "document_type": result["type"]
        }
    except Exception as e:
        # File is saved but processing failed
        print(f"Processing error: {str(e)}")
        return {
            "success": False,
            "message": "File uploaded but processing failed",
            "filename": file.filename,
            "size_bytes": file_size,
            "error": str(e)
        }


@app.post("/chat")
def Chat(req:ChatRequest):
    # Add user message to history
    conversation_history.append({"role": "user", "content": req.message})
    
    # Define tool for RAG - enabling the model to decide when to search
    tools: list[ChatCompletionToolParam] = [
        {
            "type": "function",
            "function": {
                "name": "search_knowledge_base",
                "description": "Searches the knowledge base for relevant documents. Use this whenever the user asks a question that might be answered by the uploaded documents.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query to match against documents"
                        }
                    },
                    "required": ["query"]
                }
            }
        }
    ]
    
    # First call - let the model decide to use a tool or answer directly
    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=conversation_history,
            tools=tools,
            tool_choice="auto"
        )
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        raise HTTPException(status_code=503, detail=f"OpenAI Service Error: {str(e)}")
    
    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls
    
    # If the model wants to use the tool (search documents)
    if tool_calls:
        print("Model decided to search knowledge base...")
        
        # Add the model's desire to call a tool to history
        conversation_history.append(response_message)
        
        # Execute tool calls
        for tool_call in tool_calls:
            if tool_call.type == "function" and tool_call.function.name == "search_knowledge_base":
                # Parse arguments (get the query generated by AI)
                import json
                function_args = json.loads(tool_call.function.arguments)
                search_query = function_args.get("query")
                
                print(f"Searching for: {search_query}")
                
                # Execute the actual search
                rag_context = get_context_for_query(search_query)
                
                # Add the search results (tool output) to conversation history
                conversation_history.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": "search_knowledge_base",
                    "content": rag_context
                })
                
        # Second call - get the final answer using the tool outputs
        try:
            final_response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=conversation_history
            )
            reply = final_response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI API Error (Second Call): {e}")
            raise HTTPException(status_code=503, detail=f"OpenAI Service Error: {str(e)}")
        
    else:
        # Model decided NOT to search (Casual conversation like "Hi", "Thanks")
        print("Model decided to answer directly (No search)")
        reply = response_message.content
    
    # Add final reply to history
    conversation_history.append({"role": "assistant", "content": reply})
    
    return {"reply": reply}


@app.get("/")
def get():
    return {"detail":"Hi How are you"}

