from fastapi import Request, HTTPException, status
import json

#Check if user is authenticated
def protected_endpoint(request: Request):    
    if 'id_token' not in request.session:
        raise HTTPException(
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
            detail="Not authorized",
            headers={
                "Location": "/login"
            }
        )
# Get current user
def get_current_user(request: Request):    
    if 'userinfo' not in request.session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    return request.session['userinfo']

# Alternative just to return None
def get_current_user_optional(request: Request):    
    if 'userinfo' not in request.session:
        return None
    
    return request.session['userinfo']
