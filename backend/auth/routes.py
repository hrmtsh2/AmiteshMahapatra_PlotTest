from urllib.parse import quote_plus, urlencode
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from auth.config import auth0_config, oauth
from config import config
from services.database_service import db_service

auth_router = APIRouter()

# redirect to auth0 login page if not logged in
@auth_router.get("/login")
async def login(request: Request):
    if 'id_token' not in request.session:
        return await oauth.auth0.authorize_redirect(
            request,
            redirect_uri=request.url_for("callback"),
            audience=config['API']['AUTH0_AUDIENCE']
        )
    return RedirectResponse(url="http://localhost:3000/")

# directs user to auth0 signup page
@auth_router.get("/signup")
async def signup(request: Request):
    if 'id_token' not in request.session:  # it could be userinfo instead of id_token
        return await oauth.auth0.authorize_redirect(
            request,
            redirect_uri=request.url_for("callback"),
            screen_hint="signup"
        )
    return RedirectResponse(url="http://localhost:3000/")

# logs the user out and redirects to login
@auth_router.get("/logout")
def logout(request: Request):
    request.session.clear()
    response = RedirectResponse(
        url="https://" + auth0_config['DOMAIN']
            + "/v2/logout?"
            + urlencode(
                {
                    "returnTo": "http://localhost:4040/login",
                    "client_id": auth0_config['CLIENT_ID'],
                },
                quote_via=quote_plus,
            )
    )
    return response

# callback redirect fron auth0 (asl isted on application settings page)
@auth_router.get("/callback")
async def callback(request: Request):
    token = await oauth.auth0.authorize_access_token(request)
    
    request.session['access_token'] = token['access_token']
    request.session['id_token'] = token['id_token']
    request.session['userinfo'] = token['userinfo']
    
    # create (or update existing) user in db
    try:
        userinfo = token['userinfo']
        user = await db_service.get_or_create_user(
            auth0_id=userinfo['sub'],
            email=userinfo['email'],
            name=userinfo.get('name', userinfo['email'])
        )
        print(f"User created/updated: {user.email}")
    except Exception as e:
        print(f"Error creating/updating user: {e}")
    
    # redirect to frontend after successful login
    return RedirectResponse(url="http://localhost:3000/")

# check auth status for frontend
@auth_router.get("/api/auth/status")
def auth_status(request: Request):
    if 'userinfo' in request.session:
        return {
            "authenticated": True,
            "user": request.session['userinfo']
        }
    else:
        return {
            "authenticated": False,
            "user": None
        }
