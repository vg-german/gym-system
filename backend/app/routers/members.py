from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from backend.app.client import supabase, verify_admin
from backend.app.schemas import MemberCreate, MemberResponse, MemberFaceRegister, MemberUpdate, FaceVerificationRequest
import math
from datetime import datetime
from uuid import UUID


router = APIRouter(prefix="/members", tags=["Members Management"])

# Calculate the euclidean distance between two face embeddings


def calculate_euclidean_distance(vector1: List[float], vector2: List[float]) -> float:
    if len(vector1) != len(vector2):
        return 1.0
    return math.sqrt(sum((v1 - v2) ** 2 for v1, v2 in zip(vector1, vector2)))


# 1. CREATE member


@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(member: MemberCreate, admin=Depends(verify_admin)):
    try:
        response = supabase.table("members").insert(
            member.model_dump()).execute()
        if not response.data:
            raise HTTPException(
                status_code=400, detail="Could not register member.")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 2. UPDATE/REGISTER FACE


@router.put("/{member_id}/register-face", response_model=MemberResponse)
def register_face(member_id: UUID, face_data: MemberFaceRegister, admin=Depends(verify_admin)):
    try:
        response = supabase.table("members").update({
            "face_embedding": face_data.face_embedding
        }).eq("id", member_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Member not found.")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# 3. READ ALL


@router.get("/", response_model=List[MemberResponse])
def get_all_members(admin=Depends(verify_admin)):
    try:
        response = supabase.table("members").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 4. READ ONE

@router.get("/{member_id}", response_model=MemberResponse)
def get_member(member_id: UUID, admin=Depends(verify_admin)):
    try:
        response = supabase.table("members").select(
            "*").eq("id", member_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Member not found.")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. UPDATE MEMBER


@router.put("/{member_id}", response_model=MemberResponse)
def update_member(member_id: UUID, member_data: MemberUpdate, admin=Depends(verify_admin)):
    update_data = {k: v for k, v in member_data.model_dump().items()
                   if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=400, detail="No fields provided for update.")
    try:
        response = supabase.table("members").update(
            update_data).eq("id", member_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Member not found.")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. DELETE MEMBER


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(member_id: UUID, admin=Depends(verify_admin)):
    try:
        response = supabase.table("members").delete().eq(
            "id", member_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Member not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 6. VERIFY ACCESS (Face Recognition)
@router.post("/verify-access", status_code=status.HTTP_200_OK)
def verify_access(request: FaceVerificationRequest):
    try:
        response = supabase.table("members").select("id", "first_name", "last_name",
                                                    "status", "face_embedding").not_.is_("face_embedding", "null").execute()

        members_in_db = response.data
        if not members_in_db:
            raise HTTPException(
                status_code=404, detail="No registered faces found in database.")

        input_face = request.face_embedding
        best_match = None
        threshold = 0.55
        min_distance = float("inf")

        for member in members_in_db:
            db_face = member["face_embedding"]
            distance = calculate_euclidean_distance(input_face, db_face)

            if distance < min_distance:
                min_distance = distance
                if distance < threshold:
                    best_match = member

        if best_match:
            if best_match["status"] == "Active":
                supabase.table("attendances").insert({
                    "member_id": best_match["id"],
                    "access_status": "Granted"
                }).execute()

                return {
                    "access": "Granted",
                    "message": f"Welcome back, {best_match['first_name']}!",
                    "member_id": best_match["id"],
                    "distance": round(min_distance, 4)
                }
            else:
                supabase.table("attendances").insert({
                    "member_id": best_match["id"],
                    "access_status": "Denied (Inactive Membership)"
                }).execute()

                return {
                    "access": "Denied",
                    "message": f"Access denied for {best_match['first_name']}. Membership is expired or inactive.",
                    "member_id": best_match["id"],
                    "distance": round(min_distance, 4)
                }
        else:
            raise HTTPException(
                status_code=404,
                detail="Face not recognized. Access Denied."
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Access control error: {str(e)}")
