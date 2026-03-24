from pydantic import BaseModel, EmailStr


class ClientBase(BaseModel):
    name: str
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(ClientBase):
    pass


class ClientOut(ClientBase):
    id: str

    model_config = {"from_attributes": True}
