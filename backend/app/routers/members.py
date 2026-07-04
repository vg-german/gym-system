from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from backend.app.client import supabase, verify_admin
from backend.app.schemas import MemberCreate, MemberResponse, MemberFaceRegister, MemberUpdate

router = APIRouter(prefix="/members", tags=["Members Management"])

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
def register_face(member_id: str, face_data: MemberFaceRegister, admin=Depends(verify_admin)):
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
def get_member(member_id: str, admin=Depends(verify_admin)):
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
def update_member(member_id: str, member_data: MemberUpdate, admin=Depends(verify_admin)):
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
def delete_member(member_id: str, admin=Depends(verify_admin)):
    try:
        response = supabase.table("members").delete().eq(
            "id", member_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Member not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
