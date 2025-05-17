import { db } from "../accountScripts/auth.js";

// User-related operations
export async function getUserApplications(userId) {
  return db
    .collection("applications")
    .where("freelancerId", "==", userId)
    .orderBy("appliedAt", "desc")
    .get();
}

export async function getUserPostedJobs(userId) {
  return db
    .collection("jobs")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();
}

export async function getJobApplicants(jobId) {
  return db.collection("applications").where("jobId", "==", jobId).get();
}

export async function getJobMilestones(jobId) {
  return db.collection("jobs").doc(jobId).collection("milestones").get();
}

export async function updateApplicationStatus(appId, status, extraData = {}) {
  const updateData = {
    status,
    updatedAt: new Date().toISOString(),
    ...extraData,
  };
  return db.collection("applications").doc(appId).update(updateData);
}

export async function addMilestone(jobId, milestoneData) {
  return db
    .collection("jobs")
    .doc(jobId)
    .collection("milestones")
    .add({
      ...milestoneData,
      createdAt: new Date().toISOString(),
    });
}

export async function updateMilestoneStatus(
  jobId,
  milestoneId,
  status,
  extraData = {}
) {
  const updateData = {
    status,
    updatedAt: new Date().toISOString(),
    ...extraData,
  };
  return db
    .collection("jobs")
    .doc(jobId)
    .collection("milestones")
    .doc(milestoneId)
    .update(updateData);
}

// Add to firestore.js
export async function recordPayment(jobId, milestoneId, paymentData) {
  const paymentRef = await db.collection("payments").add({
    jobId,
    milestoneId,
    ...paymentData,
    createdAt: new Date().toISOString(),
    paymentDate: new Date().toISOString(),
    status: "completed", // or "pending"/"failed"
  });

  // Update milestone status
  await db
    .collection("jobs")
    .doc(jobId)
    .collection("milestones")
    .doc(milestoneId)
    .update({
      paymentStatus: "paid",
      paymentId: paymentRef.id,
    });

  return paymentRef;
}

export async function getUserPayments(userId, role) {
  let query;
  if (role === "client") {
    const jobs = await db
      .collection("jobs")
      .where("userId", "==", userId)
      .get();
    const jobIds = jobs.docs.map((doc) => doc.id);
    query = await db
      .collection("payments")
      .where("jobId", "in", jobIds)
      .orderBy("paymentDate", "desc")
      .get();
  } else {
    query = await db
      .collection("payments")
      .where("freelancerId", "==", userId)
      .orderBy("paymentDate", "desc")
      .get();
  }
  return query.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
