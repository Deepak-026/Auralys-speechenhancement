class AuralysError(Exception):
    """Base exception for all AURALYS errors."""
    pass

class ValidationError(AuralysError):
    """Raised when input validation fails."""
    pass

class DecodingError(AuralysError):
    """Raised when audio decoding fails."""
    pass

class PreprocessingError(AuralysError):
    """Raised during preprocessing pipeline failures."""
    pass

class ModelError(AuralysError):
    """Raised when model loading or inference fails."""
    pass

class PostprocessingError(AuralysError):
    """Raised during postprocessing pipeline failures."""
    pass

class EncodingError(AuralysError):
    """Raised when audio encoding/saving fails."""
    pass
