from fastapi import APIRouter, Depends, HTTPException, status, Query
from uuid import UUID
from typing import Optional
from datetime import datetime
from zoneinfo import ZoneInfo
from dateutil.relativedelta import relativedelta
from app.schemas import SubscriptionCreate, PaginatedSubscriptionResponse, SubscriptionItemResponse
from app.client import supabase, verify_admin

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


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


@router.get("", response_model=PaginatedSubscriptionResponse, status_code=status.HTTP_200_OK)
def get_subscriptions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    admin=Depends(verify_admin)
):
    try:
        start_index = (page - 1) * limit
        end_index = start_index + limit - 1

        query = supabase.table("subscriptions").select(
            "id",
            "start_date",
            "end_date",
            "members (first_name, last_name, email, status)",
            "memberships (name)",
            count="exact"
        )

        subscriptions_response = query.order("created_at", desc=True).execute()
        raw_subscriptions = subscriptions_response.data

        total_items = subscriptions_response.count or 0
        processed_items = []

        for sub in raw_subscriptions:
            member_data = sub.get("members", {}) or {}
            membership_data = sub.get("memberships", {}) or {}

            first_name = member_data.get("first_name", "") or ""
            last_name = member_data.get("last_name", "") or ""
            email = member_data.get("email", "") or ""

            member_status = member_data.get("status", "Inactive") or "Inactive"

            full_name = f"{first_name} {last_name}".strip()

            if status_filter:
                if member_status.lower() != status_filter.lower():
                    continue

            if search:
                search_lower = search.lower()
                if (search_lower not in first_name.lower() and
                    search_lower not in last_name.lower() and
                        search_lower not in email.lower()):
                    continue

            processed_item = {
                "id": sub["id"],
                "member_name": full_name if full_name else "Unknown Member",
                "email": email if email else "No Email",
                "plan_name": membership_data.get("name", "No Plan"),
                "start_date": sub["start_date"],
                "end_date": sub["end_date"],
                "status": member_status
            }

            processed_items.append(SubscriptionItemResponse(**processed_item))

        if search or status_filter:
            total_items = len(processed_items)

        paginated_items = processed_items[start_index:end_index + 1]
        total_pages = (total_items + limit -
                       1) // limit if total_items > 0 else 1

        return PaginatedSubscriptionResponse(
            items=paginated_items,
            total_pages=total_pages,
            current_page=page,
            total_items=total_items
        )

    except Exception as e:
        print(f"Error detectado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
