from fastapi import HTTPException, status

class EntityNotFoundError(HTTPException):
    def __init__(self, entity: str, entity_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity} with identifier '{entity_id}' was not found.",
        )

class InsufficientCreditsError(HTTPException):
    def __init__(self, required: int, available: int):
        super().__init__(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient service credits. Operation requires {required} credits, but current balance is {available}.",
        )

class UnverifiedAssetError(HTTPException):
    def __init__(self, asset_name: str):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Target asset '{asset_name}' is not verified. Defensive audits require domain ownership verification token.",
        )

class ValidationError(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=message,
        )
