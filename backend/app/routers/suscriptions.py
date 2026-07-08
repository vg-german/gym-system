from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
from datetime import datetime
from zoneinfo import ZoneInfo
from dateutil.relativedelta import relativedelta
from backend.app.schemas import SubscriptionCreate
from backend.app.client import supabase, verify_admin

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.post("/purchase", status_code=status.HTTP_201_CREATED)
def purchase_membership(request: SubscriptionCreate, token_data: dict = Depends(verify_admin)):
    try:
        # 1. Verify that the member exists in the 'members' table
        member_check = supabase.table("members").select(
            "id", "first_name").eq("id", str(request.member_id)).execute()
        if not member_check.data:
            raise HTTPException(status_code=404, detail="Member not found.")

        # 2. Verify that the membership plan exists in the catalog and obtain its months
        membership_check = supabase.table("memberships").select(
            "contract_period").eq("id", request.membership_id).execute()
        if not membership_check.data:
            raise HTTPException(
                status_code=404, detail="Membership plan not found.")

        months_to_add = membership_check.data[0]["contract_period"]

        # 3. Calculate the start and end dates for the subscription

        local_tz = ZoneInfo("America/Mexico_City")  #

        now_local = datetime.now(local_tz)
        start_date = now_local.date()

        end_date = start_date + relativedelta(months=months_to_add)

        # 4. Insert the new subscription into the 'subscriptions' table
        sub_response = supabase.table("subscriptions").insert({
            "member_id": str(request.member_id),
            "membership_id": request.membership_id,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }).execute()

        # 5. Activate the member's status in the 'members' table
        supabase.table("members").update({"status": "Active"}).eq(
            "id", str(request.member_id)).execute()

        return {
            "status": "success",
            "message": f"Membership activated successfully for {member_check.data[0]['first_name']}!",
            "details": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "contract_months": months_to_add
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Subscription error: {str(e)}")
