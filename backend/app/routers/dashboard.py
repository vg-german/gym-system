from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas import DashboardStats, AccessLogResponse
from app.client import verify_admin, supabase
from uuid import UUID
from datetime import datetime, time
from zoneinfo import ZoneInfo

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def get_today_utc_range():
    mexico_tz = ZoneInfo("America/Mexico_City")
    now_mexico = datetime.now(mexico_tz)

    start_of_day_mexico = datetime.combine(
        now_mexico.date(), time.min, tzinfo=mexico_tz)
    end_of_day_mexico = datetime.combine(
        now_mexico.date(), time.max, tzinfo=mexico_tz)

    start_of_day_utc = start_of_day_mexico.astimezone(
        ZoneInfo("UTC")).isoformat()
    end_of_day_utc = end_of_day_mexico.astimezone(
        ZoneInfo("UTC")).isoformat()

    return start_of_day_utc, end_of_day_utc


@router.get("/stats", response_model=DashboardStats, status_code=status.HTTP_200_OK)
def get_dashboard_stats(admin=Depends(verify_admin)):
    try:
        # Total members
        total_members_response = supabase.table(
            "members").select("id", count="exact").execute()
        total_members = total_members_response.count

        # Active subscribers
        active_subscribers_response = supabase.table("members").select(
            "id", count="exact").eq("status", "Active").execute()
        active_subscribers = active_subscribers_response.count

        # Today's check-ins
        start_of_day_utc, end_of_day_utc = get_today_utc_range()
        today_checkins_response = supabase.table(
            "attendances").select("id", count="exact").gte("check_in", start_of_day_utc).lt("check_in", end_of_day_utc).execute()
        today_checkins = today_checkins_response.count

        return DashboardStats(
            total_members=total_members,
            active_subscribers=active_subscribers,
            today_checkins=today_checkins
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/access-logs", response_model=list[AccessLogResponse], status_code=status.HTTP_200_OK)
def get_access_logs(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    admin=Depends(verify_admin)
):
    try:
        mexico_tz = ZoneInfo("America/Mexico_City")

        start_of_day_utc, end_of_day_utc = get_today_utc_range()

        start_index = (page - 1) * size
        end_index = start_index + size - 1

        access_logs_response = supabase.table("attendances").select(
            "id",
            "check_in",
            "access_status",
            "members (first_name, last_name, email)"
        ).gte("check_in", start_of_day_utc) \
         .lt("check_in", end_of_day_utc) \
         .order("check_in", desc=True) \
         .range(start_index, end_index) \
         .execute()

        raw_logs = access_logs_response.data
        processed_logs = []

        utc_tz = ZoneInfo("UTC")

        for log in raw_logs:
            member_data = log.get("members", {}) or {}

            raw_check_in = log["check_in"]
            if raw_check_in.endswith('Z'):
                raw_check_in = raw_check_in[:-1] + '+00:00'

            utc_dt = datetime.fromisoformat(raw_check_in)
            if utc_dt.tzinfo is None:
                utc_dt = utc_dt.replace(tzinfo=utc_tz)

            mexico_dt = utc_dt.astimezone(mexico_tz)
            datetime_formatted = mexico_dt.strftime("%Y-%m-%d %H:%M:%S")

            processed_log = {
                "id": log["id"],
                "name": f"{member_data.get('first_name', '')} {member_data.get('last_name', '')}".strip() or "Unknown User",
                "time": datetime_formatted,
                "status": log["access_status"],
                "email": member_data.get("email", "")
            }

            processed_logs.append(AccessLogResponse(**processed_log))

        return processed_logs

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
