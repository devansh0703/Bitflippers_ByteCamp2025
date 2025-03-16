import os
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from supabase import create_client, Client
from datetime import datetime, timedelta

# -----------------------------
# Supabase credentials (hardcoded for now; in production, use environment variables)
# -----------------------------
SUPABASE_URL = "https://lartzlrawidhmcmixnmb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcnR6bHJhd2lkaG1jbWl4bm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMjgzNzgsImV4cCI6MjA1NzYwNDM3OH0.dlARnACtw2QBoh9l_byup8Ij2ws_8jmEaaomPHq0bnQ"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Smart Circular Cities API")

# -----------------------------
# CORS Middleware
# -----------------------------
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# Pydantic models
# ============================
class User(BaseModel):
    id: int
    username: str
    email: str
    role: str
    password: str
    points: int
    badges: List[str] = []
    created_at: Optional[datetime] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    message: str
    user: User

class CreateUserRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = Field(..., pattern="^(user|moderator)$")

class SubmissionRequest(BaseModel):
    user_id: int
    submission_type: str = Field(..., pattern="^(power|waste|tree)$")
    location: str          # Google Maps location description
    latitude: float
    longitude: float
    description: str
    image_url: str
    parent_submission_id: Optional[int] = None  # Null for original submissions

class SubmissionResponse(BaseModel):
    message: str
    submission: dict

class ModeratorApprovalRequest(BaseModel):
    moderator_id: int
    submission_id: int
    decision: str = Field(..., pattern="^(approved|rejected)$")
    remarks: Optional[str] = None

class ApprovalResponse(BaseModel):
    message: str

# ============================
# Stub GenAI function (can be replaced with actual integration)
# ============================
def perform_genai_analysis(submission: dict) -> dict:
    stype = submission.get("submission_type")
    if stype in ["waste", "tree"]:
        return {"authentic": True, "confidence": 0.95}
    elif stype == "power":
        return {"summary": "Detailed power innovation report analysis.", "plausibility": 0.90}
    return {}

# ============================
# New Function: Get GenAI Output
# ============================
def get_genai_output(submission: dict) -> dict:
    """
    Uses the submission's description and image_url to generate a GenAI analysis.
    Returns a hardcoded result along with the detailed analysis from the Gemini API.
    """
    import requests, base64, re, json, google.generativeai as genai

    # Configure Gemini API Key
    genai.configure(api_key="AIzaSyB1Bo_S29PIDaTDz0lbnW6fIzTfARa0BnM")

    description = submission.get("description", "")
    image_url = submission.get("image_url")
    if not image_url:
        return {"result": "No image URL provided"}
    
    try:
        # Set a custom User-Agent header to fetch the image from external sources
        headers = {"User-Agent": "SmartCircularCities/1.0 (your_email@example.com)"}
        response = requests.get(image_url, headers=headers)
        response.raise_for_status()
        image_data = response.content
        image_base64 = base64.b64encode(image_data).decode("utf-8")
    except Exception as e:
        return {"result": "Error fetching image", "error": str(e)}
    
    prompt = f"""
    You are an AI analyzing a submission for waste management and tree plantations.
    The submission description is:
    \"\"\"{description}\"\"\"
    And here is the image (base64 encoded):
    {image_base64}
    
    Provide the result in strict JSON format (no extra text) with the following fields:
    {{
      "authenticity_flag": "Real" or "Fake",
      "confidence_score": "85%",
      "explanation": "Detailed reason why the submission is real or fake."
    }}
    
    Ensure the output is valid JSON format only.
    """
    
    model = genai.GenerativeModel("gemini-1.5-flash")
    result = model.generate_content([
        {"mime_type": "image/jpeg", "data": image_base64},
        prompt
    ])
    print("Raw API Response in get_genai_output:", result.text)
    json_match = re.search(r"\{.*\}", result.text, re.DOTALL)
    json_text = json_match.group(0) if json_match else "{}"
    try:
        analysis = json.loads(json_text)
    except json.JSONDecodeError:
        analysis = {
            "authenticity_flag": "unknown",
            "confidence_score": "Unknown",
            "explanation": "Failed to parse response. Check AI output format."
        }
    return {"result": "Yes, this seems legit", "analysis": analysis}

# ============================
# Helper function: Update user points
# ============================
def update_user_points(user_id: int, additional_points: int):
    res = supabase.table("users").select("points").eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found for updating points")
    current_points = res.data[0]["points"]
    new_points = current_points + additional_points
    update_res = supabase.table("users").update({"points": new_points}).eq("id", user_id).execute()
    if not update_res.data:
        raise HTTPException(status_code=500, detail="Failed to update user points")
    return new_points

# ============================
# Email Sending Function using Gmail SMTP
# ============================
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(recipient_email: str, subject: str, text: str):
    sender_email = "devansh2020raulo@gmail.com"  # Replace with your Gmail address
    sender_password = "wwac orzx cluo cndb"  # Your Gmail App Password
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = recipient_email
    part1 = MIMEText(text, "plain")
    message.attach(part1)
    
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, message.as_string())
        print(f"Email sent to {recipient_email}")
    except Exception as e:
        print(f"Error sending email to {recipient_email}: {e}")

# ============================
# API Endpoints
# ============================
@app.get("/")
def root():
    return {"message": "Smart Circular Cities API is running."}

# User login
@app.post("/login", response_model=LoginResponse)
def login(login_req: LoginRequest):
    response = supabase.table("users").select("*").eq("username", login_req.username).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    user = response.data[0]
    if user["password"] != login_req.password:
        raise HTTPException(status_code=401, detail="Incorrect password")
    return LoginResponse(message="Login successful", user=User(**user))

# Create a new user (or moderator)
@app.post("/users/create", response_model=User)
def create_user(new_user: CreateUserRequest):
    check = supabase.table("users").select("*").or_(f"username.eq.{new_user.username},email.eq.{new_user.email}").execute()
    if check.data:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    insert_res = supabase.table("users").insert(new_user.dict()).execute()
    if not insert_res.data:
        raise HTTPException(status_code=400, detail="Error creating user")
    return User(**insert_res.data[0])

@app.get("/users", response_model=List[User])
def get_users():
    response = supabase.table("users").select("*").execute()
    return [User(**u) for u in response.data] if response.data else []

# Create a new submission
@app.post("/submissions", response_model=SubmissionResponse)
def create_submission(sub_req: SubmissionRequest):
    submission_data = sub_req.dict()
    # Duplicate check: For original submissions, if same image_url exists within past week, reject.
    if submission_data.get("parent_submission_id") is None:
        one_week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        dup = supabase.table("submissions").select("*")\
            .eq("image_url", submission_data["image_url"])\
            .is_("parent_submission_id", None)\
            .gte("created_at", one_week_ago).execute()
        if dup.data:
            raise HTTPException(status_code=400, detail="Submission for this image URL already exists within the past week")
    
    # Use the new GenAI function to generate output
    genai_output = get_genai_output(submission_data)
    submission_data["genai_analysis"] = genai_output
    
    insert_response = supabase.table("submissions").insert(submission_data).execute()
    if not insert_response.data:
        raise HTTPException(status_code=400, detail="Error creating submission")
    
    # Send email notifications to the submitting user and all moderators.
    user_res = supabase.table("users").select("email").eq("id", submission_data["user_id"]).execute()
    if user_res.data:
        user_email = user_res.data[0]["email"]
        send_email(user_email, "Submission Created", f"Your submission '{submission_data['description']}' has been created.")
    
    mod_res = supabase.table("users").select("email").eq("role", "moderator").execute()
    if mod_res.data:
        for mod in mod_res.data:
            send_email(mod["email"], "New Submission Alert", f"A new submission '{submission_data['description']}' has been created.")
    
    return SubmissionResponse(message="Submission created successfully", submission=insert_response.data[0])

# Get submissions (filter by status and type)
@app.get("/submissions")
def get_submissions(status: Optional[str] = Query("approved", pattern="^(pending|approved|rejected)$"),
                    submission_type: Optional[str] = Query(None, pattern="^(power|waste|tree)$")):
    query = supabase.table("submissions").select("*").eq("status", status)
    if submission_type:
        query = query.eq("submission_type", submission_type)
    response = query.execute()
    return response.data if response.data is not None else []

# Get single submission details
@app.get("/submissions/{submission_id}")
def get_submission_details(submission_id: int):
    response = supabase.table("submissions").select("*").eq("id", submission_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Submission not found")
    return response.data[0]

# Moderator: Get pending submissions for a given type
@app.get("/moderator/submissions")
def get_pending_submissions(submission_type: Optional[str] = Query(..., pattern="^(power|waste|tree)$")):
    response = supabase.table("submissions").select("*").eq("status", "pending").eq("submission_type", submission_type).execute()
    return response.data if response.data is not None else []

# Moderator: Approve a submission (for both original and solution submissions)
@app.post("/moderator/approve", response_model=ApprovalResponse)
def moderator_approve(approval_req: ModeratorApprovalRequest):
    sub_response = supabase.table("submissions").select("*").eq("id", approval_req.submission_id).execute()
    if not sub_response.data:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission = sub_response.data[0]
    
    update_response = supabase.table("submissions").update({"status": approval_req.decision}).eq("id", approval_req.submission_id).execute()
    if not update_response.data:
        raise HTTPException(status_code=500, detail="Failed to update submission status")
    
    mod_response = supabase.table("moderator_approvals").insert({
        "submission_id": approval_req.submission_id,
        "moderator_id": approval_req.moderator_id,
        "decision": approval_req.decision,
        "remarks": approval_req.remarks
    }).execute()
    if not mod_response.data:
        raise HTTPException(status_code=500, detail="Failed to log moderator decision")
    
    if approval_req.decision == "approved":
        # For original submissions:
        if submission.get("parent_submission_id") is None:
            update_user_points(submission["user_id"], 10)
            user_email = supabase.table("users").select("email").eq("id", submission["user_id"]).execute().data[0]["email"]
            send_email(user_email, "Submission Approved", f"Your submission '{submission['description']}' has been approved.")
        else:
            # For solution submissions:
            update_user_points(submission["user_id"], 100)
            parent_id = submission["parent_submission_id"]
            supabase.table("submissions").update({"status": "resolved"}).eq("id", parent_id).execute()
            orig_user = supabase.table("submissions").select("user_id").eq("id", parent_id).execute().data[0]["user_id"]
            orig_email = supabase.table("users").select("email").eq("id", orig_user).execute().data[0]["email"]
            send_email(orig_email, "Your Request Has Been Solved", f"Your submission has been solved by a solution.")
            solver_email = supabase.table("users").select("email").eq("id", submission["user_id"]).execute().data[0]["email"]
            send_email(solver_email, "Solution Accepted", f"Your solution for the submission '{submission['description']}' has been accepted.")
    
    return ApprovalResponse(message=f"Submission {approval_req.decision} and points awarded if approved.")

# Moderator: Manually resolve a submission (if moderator solves it)
@app.post("/moderator/resolve", response_model=ApprovalResponse)
def moderator_resolve(submission_id: int, moderator_id: int):
    update_response = supabase.table("submissions").update({"status": "resolved"}).eq("id", submission_id).execute()
    if not update_response.data:
        raise HTTPException(status_code=500, detail="Failed to update submission status")
    update_user_points(moderator_id, 50)
    sub = supabase.table("submissions").select("*").eq("id", submission_id).execute().data[0]
    user_email = supabase.table("users").select("email").eq("id", sub["user_id"]).execute().data[0]["email"]
    send_email(user_email, "Your Request Has Been Solved", f"Your submission '{sub['description']}' has been solved.")
    return ApprovalResponse(message="Submission resolved; moderator awarded 50 points.")

# Moderator: Get all moderator approval logs
@app.get("/moderator/approvals")
def get_moderator_approvals():
    response = supabase.table("moderator_approvals").select("*").execute()
    return response.data if response.data is not None else []

# Leaderboard: Get users sorted by points descending
@app.get("/leaderboard")
def leaderboard():
    response = supabase.table("users").select("*").order("points", desc=True).execute()
    return response.data if response.data is not None else []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)

