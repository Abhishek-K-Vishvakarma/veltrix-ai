from datetime import datetime

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
ROLE_PATTERN = r"^(user|admin)$"


class UserCreate(BaseModel):
    email: str = Field(pattern=EMAIL_PATTERN)
    full_name: str = Field("", max_length=120)
    password: str = Field(min_length=8, max_length=72)


class AdminUserCreate(UserCreate):
    role: str = Field("user", pattern=ROLE_PATTERN)


class AdminUserUpdate(BaseModel):
    full_name: str | None = Field(None, max_length=120)
    role: str | None = Field(None, pattern=ROLE_PATTERN)
    is_active: bool | None = None


class PasswordReset(BaseModel):
    new_password: str = Field(min_length=8, max_length=72)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    last_login_at: datetime | None = None


class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)


class NotificationPreferences(BaseModel):
    analysis_completed: bool
    analysis_failed: bool
    weekly_summary: bool


class UserPreferencesOut(BaseModel):
    theme: Literal["light", "dark"] = "light"
    language: Literal["en"] = "en"
    analysis_detail: Literal["concise", "detailed"] = "detailed"
    notifications: NotificationPreferences = Field(
        default_factory=lambda: NotificationPreferences(
            analysis_completed=True,
            analysis_failed=True,
            weekly_summary=False,
        )
    )


class UserPreferencesUpdate(BaseModel):
    theme: Literal["light", "dark"]
    language: Literal["en"]
    analysis_detail: Literal["concise", "detailed"]
    notifications: NotificationPreferences


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=72)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
