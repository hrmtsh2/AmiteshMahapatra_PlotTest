from datetime import datetime
from typing import List, Optional, Dict, Any
from prisma import Prisma
from prisma.models import User, CsvFile
import json

# Used type annotations for pydantic safety

class DatabaseService:
    def __init__(self):
        self.prisma = Prisma()
    
    async def connect(self):
        await self.prisma.connect()
    
    async def disconnect(self):
        await self.prisma.disconnect()
    
    #Get existing user or create new user
    async def get_or_create_user(self, auth0_id: str, email: str, name: str = None) -> User:
        user = await self.prisma.user.find_unique(where={"auth0Id": auth0_id})        
        if not user:
            user = await self.prisma.user.create(
                data={
                    "auth0Id": auth0_id,
                    "email": email,
                    "name": name
                }
            )
        else:
            # Update user info if it has changed
            if user.email != email or user.name != name:
                user = await self.prisma.user.update(
                    where={"id": user.id},
                    data={
                        "email": email,
                        "name": name
                    }
                )
        
        return user
    
    # Save CSV file with configuration
    async def save_csv_file(
        self,
        user_id: str,
        filename: str,
        original_name: str,
        file_content: str,
        file_size: int,
        columns: List[str],
        total_rows: int,
        description: str = None,
        x_column: str = None,
        y_column: str = None,
        max_rows: int = None,
        x_range_min: float = None,
        x_range_max: float = None,
        y_range_min: float = None,
        y_range_max: float = None
    ) -> CsvFile:        
        csv_file = await self.prisma.csvfile.create(
            data={
                "userId": user_id,
                "filename": filename,
                "originalName": original_name,
                "fileContent": file_content,
                "fileSize": file_size,
                "columns": columns,
                "totalRows": total_rows,
                "description": description,
                "xColumn": x_column,
                "yColumn": y_column,
                "maxRows": max_rows,
                "xRangeMin": x_range_min,
                "xRangeMax": x_range_max,
                "yRangeMin": y_range_min,
                "yRangeMax": y_range_max
            }
        )
        return csv_file
    
    # Get all csv files for the user by their auth0 ID
    async def get_user_csv_files(self, auth0_id: str) -> List[CsvFile]:        
        user = await self.prisma.user.find_unique(where={"auth0Id": auth0_id})
        if not user:
            return []
        
        files = await self.prisma.csvfile.find_many(
            where={"userId": user.id}
        )
        return files
    
    # Get a specific csv file for the user by their auth0 ID
    async def get_csv_file(self, file_id: str, auth0_id: str) -> Optional[CsvFile]:        
        user = await self.prisma.user.find_unique(where={"auth0Id": auth0_id})
        if not user:
            return None
            
        csv_file = await self.prisma.csvfile.find_first(
            where={
                "id": file_id,
                "userId": user.id
            }
        )
        return csv_file
    
    # update csv file configuration by auth0 id
    async def update_csv_configuration(
        self,
        file_id: str,
        auth0_id: str,
        x_column: str = None,
        y_column: str = None,
        max_rows: int = None,
        x_range_min: float = None,
        x_range_max: float = None,
        y_range_min: float = None,
        y_range_max: float = None,
        description: str = None
    ) -> Optional[CsvFile]:
        # find the user by id
        user = await self.prisma.user.find_unique(where={"auth0Id": auth0_id})
        if not user:
            return None
        
        # Check if the CSV file belongs to this user
        csv_file = await self.prisma.csvfile.find_first(
            where={
                "id": file_id,
                "userId": user.id
            }
        )
        if not csv_file:
            return None
        
        update_data = {}
        
        if x_column is not None:
            update_data["xColumn"] = x_column
        if y_column is not None:
            update_data["yColumn"] = y_column
        if max_rows is not None:
            update_data["maxRows"] = max_rows
        if x_range_min is not None:
            update_data["xRangeMin"] = x_range_min
        if x_range_max is not None:
            update_data["xRangeMax"] = x_range_max
        if y_range_min is not None:
            update_data["yRangeMin"] = y_range_min
        if y_range_max is not None:
            update_data["yRangeMax"] = y_range_max
        if description is not None:
            update_data["description"] = description
        
        if not update_data:
            return None
        
        updated_csv_file = await self.prisma.csvfile.update(
            where={"id": file_id},
            data=update_data
        )
        return updated_csv_file
    
    # delete file by auth0 id
    async def delete_csv_file(self, file_id: str, auth0_id: str) -> bool:
        try:
            # find the user by id
            user = await self.prisma.user.find_unique(where={"auth0Id": auth0_id})
            if not user:
                return False
            # delete
            await self.prisma.csvfile.delete(
                where={
                    "id": file_id,
                    "userId": user.id
                }
            )
            return True
        except:
            return False

# Global database service instance
db_service = DatabaseService()
