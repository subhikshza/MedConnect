// Dummy data for frontend-first development.
// Later, swap these imports for axios.get() calls — components stay the same.
// Shapes follow the ER diagram: USERS / DOCTORS / PATIENTS / APPOINTMENTS.

export const doctors = [
  {
    doctor_id: 1,
    user_id: 101,
    name: 'Dr. Aarthi Ramesh',
    specialization: 'Cardiologist',
    experience: 12,
    available_days: 'Mon, Wed, Fri',
    available_time: '10:00 AM - 1:00 PM',
    fee: 600,
    rating: 4.8,
  },
  {
    doctor_id: 2,
    user_id: 102,
    name: 'Dr. Karthik Subramaniam',
    specialization: 'Dermatologist',
    experience: 8,
    available_days: 'Tue, Thu, Sat',
    available_time: '11:00 AM - 2:00 PM',
    fee: 500,
    rating: 4.6,
  },
  {
    doctor_id: 3,
    user_id: 103,
    name: 'Dr. Priya Nair',
    specialization: 'Pediatrician',
    experience: 15,
    available_days: 'Mon, Tue, Wed, Fri',
    available_time: '9:00 AM - 12:00 PM',
    fee: 550,
    rating: 4.9,
  },
  {
    doctor_id: 4,
    user_id: 104,
    name: 'Dr. Rahul Menon',
    specialization: 'Orthopedic',
    experience: 10,
    available_days: 'Wed, Thu, Sat',
    available_time: '2:00 PM - 5:00 PM',
    fee: 700,
    rating: 4.5,
  },
  {
    doctor_id: 5,
    user_id: 105,
    name: 'Dr. Sneha Iyer',
    specialization: 'Gynecologist',
    experience: 14,
    available_days: 'Mon, Thu, Fri',
    available_time: '10:00 AM - 1:00 PM',
    fee: 650,
    rating: 4.7,
  },
  {
    doctor_id: 6,
    user_id: 106,
    name: 'Dr. Vignesh Kumar',
    specialization: 'General Physician',
    experience: 6,
    available_days: 'Mon - Sat',
    available_time: '9:00 AM - 6:00 PM',
    fee: 400,
    rating: 4.4,
  },
]

// Appointment statuses (STATUS enum): Pending, Accepted, Rejected, Cancelled, Completed
export const appointments = [
  {
    appointment_id: 1,
    patient_id: 201,
    doctor_id: 1,
    doctor_name: 'Dr. Aarthi Ramesh',
    specialization: 'Cardiologist',
    appointment_date: '2026-08-05',
    appointment_time: '10:30 AM',
    status: 'Pending',
    created_at: '2026-07-28',
  },
  {
    appointment_id: 2,
    patient_id: 201,
    doctor_id: 3,
    doctor_name: 'Dr. Priya Nair',
    specialization: 'Pediatrician',
    appointment_date: '2026-08-02',
    appointment_time: '09:30 AM',
    status: 'Accepted',
    created_at: '2026-07-25',
  },
  {
    appointment_id: 3,
    patient_id: 201,
    doctor_id: 2,
    doctor_name: 'Dr. Karthik Subramaniam',
    specialization: 'Dermatologist',
    appointment_date: '2026-07-20',
    appointment_time: '11:30 AM',
    status: 'Completed',
    created_at: '2026-07-15',
  },
]

// Incoming requests shown on the Doctor Dashboard
export const appointmentRequests = [
  {
    appointment_id: 101,
    patient_name: 'Ravi Kumar',
    age: 34,
    gender: 'Male',
    appointment_date: '2026-08-04',
    appointment_time: '10:00 AM',
    reason: 'Chest pain, follow-up',
    status: 'Pending',
  },
  {
    appointment_id: 102,
    patient_name: 'Meena Lakshmi',
    age: 28,
    gender: 'Female',
    appointment_date: '2026-08-04',
    appointment_time: '10:30 AM',
    reason: 'General check-up',
    status: 'Pending',
  },
  {
    appointment_id: 103,
    patient_name: 'Arun Prakash',
    age: 45,
    gender: 'Male',
    appointment_date: '2026-08-05',
    appointment_time: '11:00 AM',
    reason: 'High BP consultation',
    status: 'Pending',
  },
]

// The logged-in doctor's own profile (mock)
export const currentDoctor = {
  doctor_id: 1,
  name: 'Dr. Aarthi Ramesh',
  specialization: 'Cardiologist',
  experience: 12,
  email: 'aarthi.ramesh@medconnect.com',
  available_days: 'Mon, Wed, Fri',
  available_time: '10:00 AM - 1:00 PM',
  fee: 600,
  rating: 4.8,
  total_patients: 128,
}

// Doctor's already-accepted upcoming appointments
export const doctorSchedule = [
  {
    appointment_id: 201,
    patient_name: 'Divya Suresh',
    appointment_date: '2026-08-02',
    appointment_time: '09:30 AM',
    reason: 'Routine heart check-up',
  },
  {
    appointment_id: 202,
    patient_name: 'Karan Mehta',
    appointment_date: '2026-08-03',
    appointment_time: '11:00 AM',
    reason: 'ECG follow-up',
  },
]

// The logged-in patient (mock)
export const currentPatient = {
  patient_id: 201,
  user_id: 101,
  name: 'Sibi Vijayakumar',
  email: 'sibi@example.com',
  age: 22,
  gender: 'Male',
  blood_group: 'O+',
}
