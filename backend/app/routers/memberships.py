from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas import MembershipCreate, MembershipResponse, MembershipUpdate, MembershipStatusUpdate
from app.client import verify_admin, supabase


router = APIRouter(prefix="/memberships", tags=["Memberships"])

# Create a new membership


@router.post("/", response_model=MembershipResponse, status_code=status.HTTP_201_CREATED)
def create_membership(membership: MembershipCreate, admin=Depends(verify_admin)):
    try:
        response = supabase.table("memberships").insert(
            membership.model_dump()).execute()
        if not response.data:
            raise HTTPException(
                status_code=400, detail="Failed to create membership.")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get all memberships


@router.get("/", response_model=List[MembershipResponse])
def get_all_memberships():
    try:
        response = supabase.table("memberships").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get One membership by ID


@router.get("/{membership_id}", response_model=MembershipResponse)
def get_membership(membership_id: int):
    try:
        response = supabase.table("memberships").select(
            "*").eq("id", membership_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=404, detail="Membership not found.")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Update a membership by ID
@router.put("/{membership_id}", response_model=MembershipResponse)
def update_membership(membership_id: int, membership: MembershipUpdate, admin=Depends(verify_admin)):
    # Filter only updated fields
    update_data = {k: v for k, v in membership.model_dump().items()
                   if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=400, detail="No fields provided for update.")

    try:
        response = supabase.table("memberships").update(
            update_data).eq("id", membership_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=404, detail="Membership plan not found or no changes made.")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Delete a membership by ID


@router.delete("/{membership_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_membership(membership_id: int, admin=Depends(verify_admin)):
    try:
        response = supabase.table("memberships").delete().eq(
            "id", membership_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=404, detail="Membership plan not found.")
        return {"detail": "Membership plan deleted successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=400, detail="Cannot delete membership plan. It may be linked to active suscriptions.")


# Pause a membership by ID

@router.patch("/{membership_id}/status")
def toggle_membership_status(membership_id: int, payload: MembershipStatusUpdate, admin=Depends(verify_admin)):
    response = supabase.table("memberships").update(
        {"status": payload.status.capitalize()}).eq("id", membership_id).execute()
    return response.data[0]
