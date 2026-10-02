from app.permissions.roles import Role


def is_admin(user) -> bool:
    return user.role == Role.ADMIN.value
