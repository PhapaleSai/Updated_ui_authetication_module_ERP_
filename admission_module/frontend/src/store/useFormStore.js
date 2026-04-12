import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_FORM_DATA = {
  applicant: {
    full_name: '',
    dob: '',
    birth_place: '',
    gender: 'Male',
    blood_group: '',
    marital_status: 'Single',
    abc_id: '',
    email: '',
    mobile_number: '',
    religion: '',
    adhar_number: '',
    nationality: 'Indian',
    caste_category: 'Open',
    is_disable_handicap: 'No',
    hosteller_or_day_scholar: 'Day Scholar',
    is_scholarship_student: 'No',
    mother_tongue: '',
    minority: 'No',
    academic_year: new Date().getFullYear().toString(),
    perm_area: '',
    perm_city: '',
    perm_country: 'India',
    perm_state: '',
    perm_district: '',
    perm_taluka: '',
    perm_pin: '',
    temp_area: '',
    temp_city: '',
    temp_country: 'India',
    temp_state: '',
    temp_district: '',
    temp_taluka: '',
    temp_pin: '',
  },
  parent_details: {
    parent_relationship: 'Father',
    name: '',
    mother_name: '',
    occupation: '',
    email: '',
    mobile_number: '',
    annual_income: '',
    guardian_name: '',
    guardian_occupation: '',
    guardian_email: '',
    guardian_mobile: ''
  },
  education: [
    {
      last_qualification_level: '',
      last_institution_college_name: '',
      university_board: '',
      passout_year: '',
      passing_month: '',
      last_exam_seat_no: '',
      total_marks: '',
      obtained_marks: '',
      percentage: null,
      batch_year: '',
      stream: '',
      grade: '',
      attempt_count: 1,
      gap_in_education: 'No',
      exam_center_code: ''
    }
  ]
};

const useFormStore = create(
  persist(
    (set) => ({
      global: {
        userId: null,
        brochureId: null,
        courseName: '',
        applicationId: null,
        status: 'pending_brochure'
      },
      formData: { ...DEFAULT_FORM_DATA },
      setGlobalState: (updates) => set((state) => ({
        global: { ...state.global, ...updates }
      })),
      updateApplicant: (data) => set((state) => ({
        formData: { ...state.formData, applicant: { ...state.formData.applicant, ...data } }
      })),
      updateParent: (data) => set((state) => ({
        formData: { ...state.formData, parent_details: { ...state.formData.parent_details, ...data } }
      })),
      updateEducation: (index, data) => set((state) => {
        const newEdu = [...state.formData.education];
        newEdu[index] = { ...newEdu[index], ...data };
        return { formData: { ...state.formData, education: newEdu } };
      }),
      addEducation: () => set((state) => ({
        formData: { ...state.formData, education: [...state.formData.education, {
            last_qualification_level: '',
            last_institution_college_name: '',
            university_board: '',
            passout_year: '',
            passing_month: '',
            last_exam_seat_no: '',
            total_marks: '',
            obtained_marks: '',
            attempt_count: 1,
            gap_in_education: 'No'
        }] }
      })),
      removeEducation: (index) => set((state) => {
        const newEdu = [...state.formData.education];
        newEdu.splice(index, 1);
        return { formData: { ...state.formData, education: newEdu } };
      }),
      resetApplicationState: () => set((state) => ({
        global: { ...state.global, applicationId: null, status: 'paid_brochure' },
        formData: { ...DEFAULT_FORM_DATA }
      })),
      clearForm: () => set({
        global: { userId: null, brochureId: null, courseName: '', applicationId: null, status: 'pending_brochure' },
        formData: { ...DEFAULT_FORM_DATA }
      })
    }),
    {
      name: 'admission-form-storage'
    }
  )
);

export default useFormStore;
