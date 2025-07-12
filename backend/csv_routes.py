from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import JSONResponse
from typing import List, Optional
import json
import uuid
from datetime import datetime
from auth.dependencies import get_current_user
from services.database_service import db_service

# CSV files specific routes

router = APIRouter()

# save the configuration to DB
@router.post("/save-csv")
async def save_csv_file(
    request: Request,
    file: UploadFile = File(...),
    description: str = Form(None),
    x_column: str = Form(None),
    y_column: str = Form(None),
    max_rows: int = Form(None),
    x_range_min: float = Form(None),
    x_range_max: float = Form(None),
    y_range_min: float = Form(None),
    y_range_max: float = Form(None)
):
    try:
        print(f"Starting CSV save process...")

        user_session = get_current_user(request)
        print(f"User authenticated: {user_session.get('email', 'Unknown')}")
        
        user = await db_service.get_or_create_user(
            auth0_id=user_session["sub"],
            email=user_session["email"],
            name=user_session.get("name", user_session["email"])
        )
        print(f"Database user: {user.id}")
        
        # Read file content
        content = await file.read()
        file_content = content.decode('utf-8')
        print(f"File content read: {len(file_content)} characters")
        
        # Parse CSV to get columns and row count
        lines = file_content.strip().split('\n')
        if not lines:
            raise HTTPException(status_code=400, detail="Empty CSV file")
        
        # Get headers
        headers = lines[0].split(',')
        headers = [h.strip().strip('"') for h in headers]
        print(f"Headers parsed: {headers}")
        
        # Count rows (excluding header)
        total_rows = len(lines) - 1
        print(f"Total rows: {total_rows}")
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}_{file.filename}"
        print(f"Generated filename: {filename}")
        
        # Save to database
        print(f"Saving to database...")
        csv_file = await db_service.save_csv_file(
            user_id=user.id,  # Use database user ID instead of Auth0 ID
            filename=filename,
            original_name=file.filename,
            file_content=file_content,
            file_size=len(content),
            columns=headers,
            total_rows=total_rows,
            description=description,
            x_column=x_column,
            y_column=y_column,
            max_rows=max_rows,
            x_range_min=x_range_min,
            x_range_max=x_range_max,
            y_range_min=y_range_min,
            y_range_max=y_range_max
        )
        print(f"CSV file saved successfully: {csv_file.id}")
        
        return JSONResponse(content={
            "success": True,
            "message": "CSV file saved successfully",
            "file_id": csv_file.id,
            "filename": csv_file.originalName
        })
        
    except Exception as e:
        print(f"Error saving CSV file: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error saving CSV file: {str(e)}")

# Get all CSV files for the current user
@router.get("/csv-files")
async def get_user_csv_files(request: Request):    
    try:
        print("Getting user CSV files...")

        user = get_current_user(request)
        print(f"User authenticated: {user.get('email', 'Unknown')}")

        files = await db_service.get_user_csv_files(user["sub"])
        print(f"Found {len(files)} files for user")
        
        # Convert to JSON-serialisable format
        files_data = []
        for file in files:
            print(f"Processing file: {file.originalName}")
            
            file_data = {
                "id": file.id,
                "filename": file.originalName,
                "description": file.description,
                "columns": file.columns,
                "totalRows": file.totalRows,
                "fileSize": file.fileSize,
                "xColumn": file.xColumn,
                "yColumn": file.yColumn,
                "maxRows": file.maxRows,
                "xRangeMin": file.xRangeMin,
                "xRangeMax": file.xRangeMax,
                "yRangeMin": file.yRangeMin,
                "yRangeMax": file.yRangeMax,
                "createdAt": file.createdAt.isoformat() if file.createdAt else None,
                "updatedAt": file.updatedAt.isoformat() if file.updatedAt else None
            }
            files_data.append(file_data)
        
        print(f"Successfully processed {len(files_data)} files")
        
        return JSONResponse(content={
            "success": True,
            "files": files_data
        })
        
    except Exception as e:
        print(f"Error getting user CSV files: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error fetching CSV files: {str(e)}")

# Get specific CSV file's content and configuration
@router.get("/csv-file/{file_id}")
async def get_csv_file(file_id: str, request: Request):
    try:
        user = get_current_user(request)
        csv_file = await db_service.get_csv_file(file_id, user["sub"])
        
        if not csv_file:
            raise HTTPException(status_code=404, detail="CSV file not found")
        
        return JSONResponse(content={
            "success": True,
            "file": {
                "id": csv_file.id,
                "filename": csv_file.originalName,
                "description": csv_file.description,
                "content": csv_file.fileContent,
                "columns": csv_file.columns,
                "totalRows": csv_file.totalRows,
                "fileSize": csv_file.fileSize,
                "xColumn": csv_file.xColumn,
                "yColumn": csv_file.yColumn,
                "maxRows": csv_file.maxRows,
                "xRangeMin": csv_file.xRangeMin,
                "xRangeMax": csv_file.xRangeMax,
                "yRangeMin": csv_file.yRangeMin,
                "yRangeMax": csv_file.yRangeMax,
                "createdAt": csv_file.createdAt.isoformat(),
                "updatedAt": csv_file.updatedAt.isoformat()
            }
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching CSV file: {str(e)}")

# update configuration
@router.put("/csv-file/{file_id}/configuration")
async def update_csv_configuration(
    file_id: str,
    request: Request,
    x_column: str = Form(None),
    y_column: str = Form(None),
    max_rows: int = Form(None),
    x_range_min: float = Form(None),
    x_range_max: float = Form(None),
    y_range_min: float = Form(None),
    y_range_max: float = Form(None),
    description: str = Form(None)
):
    try:
        user = get_current_user(request)
        csv_file = await db_service.update_csv_configuration(
            file_id=file_id,
            auth0_id=user["sub"],
            x_column=x_column,
            y_column=y_column,
            max_rows=max_rows,
            x_range_min=x_range_min,
            x_range_max=x_range_max,
            y_range_min=y_range_min,
            y_range_max=y_range_max,
            description=description
        )
        
        if not csv_file:
            raise HTTPException(status_code=404, detail="CSV file not found")
        
        return JSONResponse(content={
            "success": True,
            "message": "Configuration updated successfully"
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating configuration: {str(e)}")

# remove csv file configuration
@router.delete("/csv-file/{file_id}")
async def delete_csv_file(file_id: str, request: Request):
    try:
        user = get_current_user(request)
        success = await db_service.delete_csv_file(file_id, user["sub"])
        
        if not success:
            raise HTTPException(status_code=404, detail="CSV file not found")
        
        return JSONResponse(content={
            "success": True,
            "message": "CSV file deleted successfully"
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting CSV file: {str(e)}")
