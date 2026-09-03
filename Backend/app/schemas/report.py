from typing import Any

from pydantic import BaseModel, Field


class ReportDataUpdate(BaseModel):
    """
    User-provided values for missing HealthLens features.
    """

    HighBP: int | None = Field(default=None, ge=0, le=1)
    HighChol: int | None = Field(default=None, ge=0, le=1)
    CholCheck: int | None = Field(default=None, ge=0, le=1)

    BMI: float | None = Field(
        default=None,
        ge=10,
        le=100
    )

    Smoker: int | None = Field(default=None, ge=0, le=1)
    Stroke: int | None = Field(default=None, ge=0, le=1)
    HeartDiseaseorAttack: int | None = Field(
        default=None,
        ge=0,
        le=1
    )

    PhysActivity: int | None = Field(default=None, ge=0, le=1)
    Fruits: int | None = Field(default=None, ge=0, le=1)
    Veggies: int | None = Field(default=None, ge=0, le=1)
    HvyAlcoholConsump: int | None = Field(
        default=None,
        ge=0,
        le=1
    )

    AnyHealthcare: int | None = Field(default=None, ge=0, le=1)
    NoDocbcCost: int | None = Field(default=None, ge=0, le=1)

    GenHlth: int | None = Field(
        default=None,
        ge=1,
        le=5
    )

    MentHlth: int | None = Field(
        default=None,
        ge=0,
        le=30
    )

    PhysHlth: int | None = Field(
        default=None,
        ge=0,
        le=30
    )

    DiffWalk: int | None = Field(default=None, ge=0, le=1)

    Sex: int | None = Field(default=None, ge=0, le=1)

    Age: int | None = Field(
        default=None,
        ge=1,
        le=13
    )

    Education: int | None = Field(
        default=None,
        ge=1,
        le=6
    )

    Income: int | None = Field(
        default=None,
        ge=1,
        le=8
    )


class TextReportRequest(BaseModel):
    """
    Raw clinical text submitted directly by the patient
    (pasted report text or a structured manual intake).
    """

    raw_text: str = Field(min_length=20, max_length=20000)
    title: str | None = Field(default=None, max_length=200)
