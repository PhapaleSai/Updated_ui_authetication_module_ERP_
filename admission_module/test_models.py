print("Importing Base...")
from app.models.base import Base
print("Importing User...")
from app.models.external import User, Course
print("Importing Brochure...")
from app.models.brochure import BrochureRequest, BroPayment
print("Importing Application...")
from app.models.application import Application, ApplicantDetails, ParentDetails, EducationDetails
print("Importing Document...")
from app.models.document import Document, DocumentVerification
print("Importing Payment...")
from app.models.payment import Payment
print("Importing Review Status...")
from app.models.review_status import ApplicationStatusLog, AdminReview, Enrollment

print("Models imported successfully!")
