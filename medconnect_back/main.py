from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import supabase

app = FastAPI()

# Allows your React app (running on a different port) to call this API.
# Without this, the browser blocks the request before it even reaches us.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "MedConnect API is running"}


@app.get("/doctors")
def get_doctors():
    response = supabase.table("doctors").select("*").execute()
    doctors_list = response.data

    # The doctors table doesn't have a "name" column — that lives in
    # users. Look each one up and attach it so the frontend doesn't have
    # to do a separate request per doctor.
    for doc in doctors_list:
        user_resp = supabase.table("users").select("name").eq("id", doc["user_id"]).maybe_single().execute()
        doc["name"] = user_resp.data["name"] if user_resp and user_resp.data else "Unknown"

    return doctors_list


# ---- Signup ----

# This describes exactly what JSON the frontend must send us.
# "id" is the Supabase Auth user's id — the frontend gets this back
# after supabase.auth.verifyOtp() succeeds, and passes it here so we
# can link this profile row to the real Auth user.
class SignupData(BaseModel):
    id: str
    name: str
    email: str
    role: str  # 'patient' or 'doctor'
    age: int | None = None
    gender: str | None = None
    blood_group: str | None = None
    specialization: str | None = None
    experience: int | None = None


@app.post("/signup")
def signup(data: SignupData):
    # upsert = insert, but if a row with this id already exists, update it
    # instead of erroring. Makes this endpoint safe to call more than once
    # for the same user (e.g. a retried request).
    supabase.table("users").upsert({
        "id": data.id,
        "email": data.email,
        "name": data.name,
        "role": data.role,
    }).execute()

    # doctors/patients don't have a unique constraint on user_id yet, so we
    # can't upsert-by-user_id here — plain insert for now (fine for a fresh
    # signup; revisit if we ever need to support editing these later).
    if data.role == "doctor":
        supabase.table("doctors").insert({
            "user_id": data.id,
            "specialization": data.specialization,
            "experience": data.experience,
        }).execute()
    else:
        supabase.table("patients").insert({
            "user_id": data.id,
            "age": data.age,
            "gender": data.gender,
            "blood_group": data.blood_group,
        }).execute()

    return {"message": "Signup successful"}


# ---- Get profile ----

# {user_id} in the URL is a path parameter — whatever's in that spot of
# the URL gets passed in as the user_id argument below. e.g. a request to
# /users/abc123 calls get_user(user_id="abc123").
@app.get("/users/{user_id}")
def get_user(user_id: str):
    user_resp = supabase.table("users").select("*").eq("id", user_id).maybe_single().execute()
    user = user_resp.data if user_resp else None
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Pull the role-specific extra fields and merge them into one profile.
    table = "doctors" if user["role"] == "doctor" else "patients"
    extra_resp = supabase.table(table).select("*").eq("user_id", user_id).maybe_single().execute()
    extra = extra_resp.data if extra_resp and extra_resp.data else {}

    merged = {**user, **extra}
    # extra['id'] (the doctors/patients row's OWN id) would silently
    # overwrite user['id'] (the real Auth user id) above — keep "id" as
    # the real user id, and expose the role-specific row's id separately
    # as "profile_id" (this is what appointments.patient_id/doctor_id
    # actually needs to reference, not the Auth user id).
    merged["id"] = user["id"]
    merged["profile_id"] = extra.get("id")
    return merged


@app.get("/doctors/{doctor_id}")
def get_doctor(doctor_id: str):
    doc_resp = supabase.table("doctors").select("*").eq("id", doctor_id).maybe_single().execute()
    doc = doc_resp.data if doc_resp else None
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")

    user_resp = supabase.table("users").select("name").eq("id", doc["user_id"]).maybe_single().execute()
    doc["name"] = user_resp.data["name"] if user_resp and user_resp.data else "Unknown"
    return doc


# ---- Book an appointment ----

class AppointmentData(BaseModel):
    patient_id: str  # this is the PATIENT's row id (from patients table), not the Auth user id
    doctor_id: str    # this is the DOCTOR's row id (from doctors table), not the Auth user id
    appointment_date: str
    appointment_time: str
    reason: str | None = None


@app.post("/appointments")
def book_appointment(data: AppointmentData):
    supabase.table("appointments").insert({
        "patient_id": data.patient_id,
        "doctor_id": data.doctor_id,
        "appointment_date": data.appointment_date,
        "appointment_time": data.appointment_time,
        "reason": data.reason,
        "status": "Pending",
    }).execute()
    return {"message": "Appointment requested"}


# ---- Doctor's appointments ----

@app.get("/doctors/{doctor_id}/appointments")
def get_doctor_appointments(doctor_id: str):
    resp = supabase.table("appointments").select("*").eq("doctor_id", doctor_id).execute()
    appts = resp.data

    # Attach patient name/age/gender for each appointment (appointments
    # table only stores patient_id, not the patient's details).
    for a in appts:
        patient_resp = supabase.table("patients").select("age, gender, user_id").eq("id", a["patient_id"]).maybe_single().execute()
        patient = patient_resp.data if patient_resp and patient_resp.data else {}
        a["age"] = patient.get("age")
        a["gender"] = patient.get("gender")

        name = "Unknown"
        user_id = patient.get("user_id")
        if user_id:
            user_resp = supabase.table("users").select("name").eq("id", user_id).maybe_single().execute()
            if user_resp and user_resp.data:
                name = user_resp.data["name"]
        a["patient_name"] = name

    return appts


# ---- Patient's appointments ----

@app.get("/patients/{patient_id}/appointments")
def get_patient_appointments(patient_id: str):
    resp = supabase.table("appointments").select("*").eq("patient_id", patient_id).execute()
    appts = resp.data

    # Attach doctor name/specialization for each appointment.
    for a in appts:
        doctor_resp = supabase.table("doctors").select("specialization, user_id").eq("id", a["doctor_id"]).maybe_single().execute()
        doctor = doctor_resp.data if doctor_resp and doctor_resp.data else {}
        a["specialization"] = doctor.get("specialization")

        name = "Unknown"
        user_id = doctor.get("user_id")
        if user_id:
            user_resp = supabase.table("users").select("name").eq("id", user_id).maybe_single().execute()
            if user_resp and user_resp.data:
                name = user_resp.data["name"]
        a["doctor_name"] = name

    return appts


# ---- Update profile ----

class ProfileUpdate(BaseModel):
    name: str | None = None
    age: int | None = None
    gender: str | None = None
    blood_group: str | None = None
    specialization: str | None = None
    experience: int | None = None


@app.put("/users/{user_id}")
def update_user(user_id: str, data: ProfileUpdate):
    user_resp = supabase.table("users").select("role").eq("id", user_id).maybe_single().execute()
    user = user_resp.data if user_resp else None
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.name is not None:
        supabase.table("users").update({"name": data.name}).eq("id", user_id).execute()

    if user["role"] == "doctor":
        updates = {}
        if data.specialization is not None:
            updates["specialization"] = data.specialization
        if data.experience is not None:
            updates["experience"] = data.experience
        if updates:
            supabase.table("doctors").update(updates).eq("user_id", user_id).execute()
    else:
        updates = {}
        if data.age is not None:
            updates["age"] = data.age
        if data.gender is not None:
            updates["gender"] = data.gender
        if data.blood_group is not None:
            updates["blood_group"] = data.blood_group
        if updates:
            supabase.table("patients").update(updates).eq("user_id", user_id).execute()

    # Return the same merged shape as GET /users/{id} so the frontend can
    # drop this straight into its auth state (profile_id included).
    return get_user(user_id)


class StatusUpdate(BaseModel):
    status: str  # 'Accepted' | 'Rejected' | 'Cancelled' | 'Completed'


@app.put("/appointments/{appointment_id}/status")
def update_appointment_status(appointment_id: str, data: StatusUpdate):
    supabase.table("appointments").update({"status": data.status}).eq("id", appointment_id).execute()
    return {"message": "Status updated"}
