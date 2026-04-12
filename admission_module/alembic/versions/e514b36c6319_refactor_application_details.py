"""refactor_application_details

Revision ID: e514b36c6319
Revises: a2c209739f61
Create Date: 2026-03-31 15:25:29.739080

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e514b36c6319'
down_revision: Union[str, None] = 'a2c209739f61'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Rename Primary Keys and handle sequences if needed (Postgres usually handles sequences automatically during rename)
    op.alter_column('application', 'app_id', new_column_name='application_id')
    op.alter_column('brochure_request', 'bro_id', new_column_name='brochure_id')
    
    # 2. Rename Foreign Keys and Other Columns
    op.alter_column('admin_review', 'app_id', new_column_name='application_id')
    op.alter_column('applicant_details', 'app_id', new_column_name='application_id')
    op.alter_column('applicant_details', 'adhar_no', new_column_name='adhar_number')
    op.alter_column('application', 'bro_id', new_column_name='brochure_id')
    op.alter_column('application_status_log', 'app_id', new_column_name='application_id')
    op.alter_column('bro_payment', 'bro_id', new_column_name='brochure_id')
    op.alter_column('brochure_request', 'bro_status', new_column_name='brochure_status')
    op.alter_column('documents', 'app_id', new_column_name='application_id')
    op.alter_column('education_details', 'edu_id', new_column_name='education_id')
    op.alter_column('education_details', 'app_id', new_column_name='application_id')
    op.alter_column('education_details', 'qualification_level', new_column_name='last_qualification_level')
    op.alter_column('education_details', 'institution_name', new_column_name='last_institution_college_name')
    op.alter_column('education_details', 'percentage_result', new_column_name='percentage')
    op.alter_column('education_details', 'batch', new_column_name='batch_year')
    op.alter_column('enrollment', 'en_id', new_column_name='enrollment_id')
    op.alter_column('enrollment', 'app_id', new_column_name='application_id')
    op.alter_column('enrollment', 'en_status', new_column_name='enrollment_status')
    op.alter_column('enrollment', 'en_date', new_column_name='enrollment_date')
    op.alter_column('parent_details', 'app_id', new_column_name='application_id')
    op.alter_column('parent_details', 'mob_no', new_column_name='mobile_number')
    op.alter_column('payment', 'app_id', new_column_name='application_id')

    # 3. Handle Boolean to String conversions
    op.alter_column('applicant_details', 'is_disabled', new_column_name='is_disable_handicap', 
                    type_=sa.String(10), postgresql_using="CASE WHEN is_disabled THEN 'Yes' ELSE 'No' END")
    op.alter_column('applicant_details', 'is_scholarship_student', 
                    type_=sa.String(10), postgresql_using="CASE WHEN is_scholarship_student THEN 'Yes' ELSE 'No' END")

    # 4. Add NEW Columns
    op.add_column('applicant_details', sa.Column('birth_place', sa.String(length=150), nullable=True))
    op.add_column('applicant_details', sa.Column('hosteller_or_day_scholar', sa.String(length=20), nullable=True))
    op.add_column('applicant_details', sa.Column('mother_tongue', sa.String(length=50), nullable=True))
    op.add_column('applicant_details', sa.Column('minority', sa.String(length=10), nullable=True, server_default='No'))
    op.add_column('applicant_details', sa.Column('academic_year', sa.String(length=50), nullable=True))
    op.add_column('applicant_details', sa.Column('perm_area', sa.String(length=255), nullable=True))
    op.add_column('applicant_details', sa.Column('perm_city', sa.String(length=100), nullable=True))
    op.add_column('applicant_details', sa.Column('perm_country', sa.String(length=100), nullable=True, server_default='India'))
    op.add_column('applicant_details', sa.Column('perm_state', sa.String(length=100), nullable=True))
    op.add_column('applicant_details', sa.Column('perm_district', sa.String(length=100), nullable=True))
    op.add_column('applicant_details', sa.Column('perm_taluka', sa.String(length=100), nullable=True))
    op.add_column('applicant_details', sa.Column('perm_pin', sa.String(length=10), nullable=True))
    op.add_column('applicant_details', sa.Column('temp_area', sa.String(length=255), nullable=True))
    op.add_column('applicant_details', sa.Column('temp_city', sa.String(length=100), nullable=True))
    op.add_column('applicant_details', sa.Column('temp_country', sa.String(length=100), nullable=True, server_default='India'))
    op.add_column('applicant_details', sa.Column('temp_state', sa.String(length=100), nullable=True))
    op.add_column('applicant_details', sa.Column('temp_district', sa.String(length=100), nullable=True))
    op.add_column('applicant_details', sa.Column('temp_taluka', sa.String(length=100), nullable=True))
    op.add_column('applicant_details', sa.Column('temp_pin', sa.String(length=10), nullable=True))
    
    op.add_column('application', sa.Column('is_active_or_not', sa.Boolean(), nullable=True, server_default='true'))
    
    op.add_column('education_details', sa.Column('passing_month', sa.String(length=20), nullable=True))
    op.add_column('education_details', sa.Column('last_exam_seat_no', sa.String(length=50), nullable=True))
    op.add_column('education_details', sa.Column('grade', sa.String(length=20), nullable=True))
    op.add_column('education_details', sa.Column('gap_in_education', sa.String(length=10), nullable=True, server_default='No'))
    op.add_column('education_details', sa.Column('exam_center_code', sa.String(length=50), nullable=True))
    
    op.add_column('parent_details', sa.Column('mother_name', sa.String(length=150), nullable=False, server_default='Unknown'))
    op.add_column('parent_details', sa.Column('annual_income', sa.Float(), nullable=False, server_default='0'))
    op.add_column('parent_details', sa.Column('guardian_name', sa.String(length=150), nullable=True))
    op.add_column('parent_details', sa.Column('guardian_occupation', sa.String(length=150), nullable=True))
    op.add_column('parent_details', sa.Column('guardian_email', sa.String(length=150), nullable=True))
    op.add_column('parent_details', sa.Column('guardian_mobile', sa.String(length=15), nullable=True))

    # 5. Handle DELETIONS (Drops)
    op.drop_column('applicant_details', 'lc_tc_path')
    op.drop_column('applicant_details', 'taluka')
    op.drop_column('applicant_details', 'caste_cert_path')
    op.drop_column('applicant_details', 'hosteller_or_dayscholar')
    op.drop_column('applicant_details', 'bank_name')
    op.drop_column('applicant_details', 'state')
    op.drop_column('applicant_details', 'account_no')
    op.drop_column('applicant_details', 'photo_path')
    op.drop_column('applicant_details', 'signature_path')
    op.drop_column('applicant_details', 'country')
    op.drop_column('applicant_details', 'annual_income') # Moved to ParentDetails
    op.drop_column('applicant_details', 'passout_result_path')
    op.drop_column('applicant_details', 'district')
    op.drop_column('applicant_details', 'ifsc_code')

def downgrade() -> None:
    # Minimal downgrade for now, focused on undoing renames
    op.alter_column('application', 'application_id', new_column_name='app_id')
    op.alter_column('brochure_request', 'brochure_id', new_column_name='bro_id')
    op.alter_column('admin_review', 'application_id', new_column_name='app_id')
    op.alter_column('applicant_details', 'application_id', new_column_name='app_id')
    # ... more renames would go here ...
    pass
