from app.core.database import get_db
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.models.external import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8000/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    outdated_session_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Your session is outdated. Please Log Out and Log Back In to refresh your portal access.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        
        # JIT Metadata
        user_id = payload.get("user_id")
        username = payload.get("username")
        full_name = payload.get("full_name")
        
        # Critical Check: If the token is old and missing metadata, we must force a re-login
        if email is None:
            raise credentials_exception
        if user_id is None or username is None:
            raise outdated_session_exception
            
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    
    if not user:
        # Auto-provision user record
        user = User(
            user_id=user_id, 
            username=username, 
            full_name=full_name, 
            email=email
        )
        db.add(user)
        try:
            await db.commit()
            await db.refresh(user)
        except Exception:
            await db.rollback()
            # Race condition check
            result = await db.execute(select(User).filter(User.email == email))
            user = result.scalars().first()
            if not user:
                raise credentials_exception
        
    user.role = role # attach role for authorization checks
    return user
