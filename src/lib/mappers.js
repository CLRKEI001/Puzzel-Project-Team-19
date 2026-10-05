// mappers.js
//
// Postgres/Supabase convention is snake_case column names (child_name,
// follow_up_date, etc). Your existing components were written for
// Firestore's camelCase field names (childName, followUpDate, etc) and
// there's a lot of JSX already relying on those names.
//
// Rather than rewriting every JSX reference across 4 components, these
// helper functions convert Postgres rows -> camelCase objects when READING
// from Supabase, and camelCase state -> snake_case payloads when WRITING
// to Supabase. This keeps all your existing component render logic
// untouched — only the data-fetching/saving code at the top of each
// component needs to change.

export function mapChildRow(r) {
  return {
    id: r.id,
    name: r.name,
    school: r.school,
    province: r.province,
    age: r.age,
    gender: r.gender,
    language: r.language,
    cognitive: r.cognitive,
    motor: r.motor,
    language_score: r.language_score, // already snake_case in the original Firestore data too
    social: r.social,
    emotion: r.emotion,
    moral: r.moral,
    total: r.total,
    status: r.status,
    flagged: r.flagged,
    referred: r.referred,
    resolved: r.resolved,
    date: r.date,
    examiner: r.examiner,
    teacherEmail: r.teacher_email,
    stage: r.stage,
    consentFormUrl: r.consent_form_url,
    consentFileName: r.consent_file_name,
    consentUploadedAt: r.consent_uploaded_at,
    consentVerified: r.consent_verified,
    consentVerificationNotes: r.consent_verification_notes,
    consentVerifiedAt: r.consent_verified_at,
    createdAt: r.created_at,
  };
}
export function mapPuzzleboxScreeningRow(r) {
  return {
    id: r.id,
    childId: r.child_id,
    childName: r.child_name,
    school: r.school,
    childAge: r.child_age,
    teacherEmail: r.teacher_email,
    teacherName: r.teacher_name,
    contentVersion: r.content_version,
    contentSnapshot: r.content_snapshot,
    status: r.status,
    responses: r.responses,
    puzzleTimeSeconds: r.puzzle_time_seconds,
    puzzleOverTime: r.puzzle_over_time,
    totalTimeSeconds: r.total_time_seconds,
    sectionTimes: r.section_times,
    observations: r.observations,
    rawScore: r.raw_score,
    interpretationBand: r.interpretation_band,
    startedAt: r.started_at,
    completedAt: r.completed_at,
    reviewedAt: r.reviewed_at,
    reviewedBy: r.reviewed_by,
    reviewVerdict: r.review_verdict,
    reviewNotes: r.review_notes,
    sharedWith: r.shared_with,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function mapSessionRow(r) {
  return {
    id: r.id,
    childId: r.child_id,
    childName: r.child_name,
    school: r.school,
    age: r.age,
    language: r.language,
    score: r.score,
    date: r.date,
    examiner: r.examiner,
    status: r.status,
    stage: r.stage,
    followUpStage: r.follow_up_stage,
    cognitive: r.cognitive,
    motor: r.motor,
    language_score: r.language_score,
    social: r.social,
    emotion: r.emotion,
    moral: r.moral,
    createdAt: r.created_at,
  };
}

export function mapFollowUpRow(r) {
  return {
    docId: r.id,        // kept as "docId" so existing ChildrenTable.js logic (existingFollowUp?.docId) needs no changes
    childId: r.child_id,
    childName: r.child_name,
    school: r.school,
    followUpDate: r.follow_up_date,
    followUpPsych: r.follow_up_psych,
    followUpReason: r.follow_up_reason,
    followUpType: r.follow_up_type,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function mapMessageRow(r) {
  return {
    id: r.id,
    childId: r.child_id,
    childName: r.child_name,
    childScore: r.child_score,
    childStatus: r.child_status,
    school: r.school,
    teacherEmail: r.teacher_email,
    teacherName: r.teacher_name,
    diagnosis: r.diagnosis,
    language: r.language,
    domains: r.domains,
    sentBy: r.sent_by,
    sentAt: r.sent_at,
    screeningId: r.screening_id,
    recipientRole: r.recipient_role,
    recipientEmail: r.recipient_email,
    recipientName: r.recipient_name,
    messageType: r.message_type,
    readAt: r.read_at,
  };
}

export function mapUserRow(r) {
  return {
    id: r.id,                    // Firebase Auth UID
    name: r.name,
    email: r.email,
    role: r.role,
    staffNumber: r.staff_number,
    isVerified: r.is_verified,
    createdAt: r.created_at,
  };
}

export function mapPurchaseRequestRow(r) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    organisation: r.organisation,
    phone: r.phone,
    numberOfScreeners: r.number_of_screeners,
    message: r.message,
    status: r.status,
    productNumber: r.product_number,
    adminNotes: r.admin_notes,
    fulfilledBy: r.fulfilled_by,
    fulfilledAt: r.fulfilled_at,
    createdAt: r.created_at,
  };
}

export function mapTrainingCertificateRow(r) {
  return {
    userId: r.user_id,
    userEmail: r.user_email,
    userName: r.user_name,
    status: r.status, // "pending" | "approved"
    requestedAt: r.requested_at,
    issuedAt: r.issued_at,
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
  };
}