const assert = require("node:assert/strict");
const test = require("node:test");
const Project = require("../models/Project");
const { checkProjectAccess, uploadFile } = require("../controllers/fileController");

const projectId = "project-1";
const ownerId = "user-owner";
const memberId = "user-member";
const memberRecordId = "member-record-1";

const project = {
  _id: { toString: () => projectId },
  owner: { toString: () => ownerId },
  members: [
    {
      _id: { toString: () => memberRecordId },
      user: { toString: () => memberId },
      status: "accepted"
    },
    {
      _id: { toString: () => "member-record-2" },
      user: { toString: () => "user-pending" },
      status: "pending"
    }
  ]
};

test("project owner can upload", () => {
  assert.equal(
    checkProjectAccess(project, { user: { _id: ownerId } }),
    true
  );
});

test("accepted member can upload but pending and unrelated users cannot", () => {
  assert.equal(
    checkProjectAccess(project, { user: { _id: memberId } }),
    true
  );
  assert.equal(
    checkProjectAccess(project, { user: { _id: "user-pending" } }),
    false
  );
  assert.equal(
    checkProjectAccess(project, { user: { _id: "user-outsider" } }),
    false
  );
});

test("accepted invitation session can access only its project", () => {
  const acceptedInvite = {
    projectId,
    memberId: memberRecordId
  };
  assert.equal(
    checkProjectAccess(project, { inviteSession: acceptedInvite }),
    true
  );
  assert.equal(
    checkProjectAccess(project, {
      inviteSession: { ...acceptedInvite, projectId: "another-project" }
    }),
    false
  );
});

test("upload handler rejects an unrelated user before calling storage", async () => {
  const originalFindProject = Project.findById;
  const response = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
  Project.findById = async () => project;

  try {
    await uploadFile(
      {
        params: { projectId },
        file: { buffer: Buffer.from("file") },
        user: { _id: "user-outsider" }
      },
      response
    );

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.message, "You are not allowed to access this project");
  } finally {
    Project.findById = originalFindProject;
  }
});
