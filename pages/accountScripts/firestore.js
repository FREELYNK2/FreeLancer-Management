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
