import base64
import os
from functools import lru_cache

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa

ENCRYPTED_PREFIX = "enc:"


def _load_private_key_from_env():
    private_key_pem = os.getenv("AUTH_PRIVATE_KEY_PEM")
    if not private_key_pem:
        return None
    normalized_pem = private_key_pem.replace("\\n", "\n")
    return serialization.load_pem_private_key(
        normalized_pem.encode("utf-8"),
        password=None,
    )


@lru_cache(maxsize=1)
def get_auth_keypair():
    private_key = _load_private_key_from_env()
    if private_key is None:
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_key = private_key.public_key()
    return private_key, public_key


def get_public_key_pem() -> str:
    _, public_key = get_auth_keypair()
    return public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")


def decrypt_client_secret(value: str) -> str:
    if not value.startswith(ENCRYPTED_PREFIX):
        return value

    payload = base64.b64decode(value[len(ENCRYPTED_PREFIX) :])
    private_key, _ = get_auth_keypair()
    decrypted = private_key.decrypt(
        payload,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    return decrypted.decode("utf-8")
