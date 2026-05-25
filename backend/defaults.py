import datetime


def default_meta():
    return {
        "projectName": "",
        "clientName": "",
        "sector": "",
        "location": "",
        "assessorName": "",
        "assessmentDate": datetime.date.today().isoformat(),
        "companyProfile": {
            "employeeCount": "",
            "country": "",
            "esmsMaturity": "",
            "budgetTier": "",
            "certifications": "",
            "operatingContext": "",
        },
    }
